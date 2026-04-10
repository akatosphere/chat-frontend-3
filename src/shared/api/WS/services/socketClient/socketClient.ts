import type { WSRequest, WSResponse } from '@/shared/api/WS/types/wsTypes';
import { chatApi } from '@/entities/Chat/api/chatApi';
import { mapApiMessageToFrontend } from '@/entities/Chat/model/mapper/mapChatType/chatMapper';
import type { AppDispatch } from '@/app/providers/StoreProvider/config/store';
import { ChatMessage, RawApiChatMessage } from '@/entities/Chat';
import { MESSAGES_PAGE_SIZE, MESSAGES_ORDERING } from '@/shared/model';
import { authActions } from '@/features/auth';
import { logger } from '@/shared/lib/logger/logger';

let isConnecting = false;
let connectPromise: Promise<WebSocket> | null = null;
let socket: WebSocket | null = null;
let isSocketInitialized = false;
let abortController: AbortController | null = null;

let wsDispatch: AppDispatch | null = null;

let currentUserId: string | null = null;

const subscribers = new Map<string, Set<(data: WSResponse) => void>>();
const pendingRequests = new Map<string, (response: WSResponse) => void>();

let currentToken: string | null = null;
let tokenExpiry = 0;

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

export const initWSHandlers = (dispatch: AppDispatch) => {
	wsDispatch = dispatch;
};

export const setWSCurrentUserId = (userId: string | null) => {
	currentUserId = userId;
};

const handleIncomingMessage = (response: WSResponse) => {
	if (response.action !== 'create_text_message') {
		return;
	}

	if (!response.object) {
		return;
	}

	if (!wsDispatch) {
		return;
	}

	const rawMessage = response.object as RawApiChatMessage;

	const fromUid =
		typeof rawMessage.from_user === 'string'
			? rawMessage.from_user
			: rawMessage.from_user?.uid;

	const toUid =
		typeof rawMessage.to_user === 'string'
			? rawMessage.to_user
			: rawMessage.to_user?.uid;

	let queryUserUid: string | undefined;

	if (rawMessage.chat_type !== 'chat' && rawMessage.chat_key) {
		// Группы/каналы: используем chat_key
		queryUserUid = rawMessage.chat_key;
	} else if (rawMessage.chat_type === 'chat' || !rawMessage.chat_key) {
		// Личные чаты: берём UID собеседника (не свой!)
		if (toUid && toUid !== currentUserId) {
			queryUserUid = toUid; // Я получатель → ключ = отправитель
		} else if (fromUid && fromUid !== currentUserId) {
			queryUserUid = fromUid; // Я отправитель → ключ = получатель
		}
	}

	if (queryUserUid) {
		wsDispatch(
			chatApi.util.updateQueryData(
				'getMessages',
				{
					user_uid: queryUserUid,

					page_size: MESSAGES_PAGE_SIZE,
					ordering: MESSAGES_ORDERING
				},
				draft => {
					if (!draft?.results) {
						logger.warn('⚠️ No draft.results');
						return;
					}

					const exists = draft.results.some(
						(m: ChatMessage) => m.uid === rawMessage.uid
					);

					if (!exists && rawMessage.uid) {
						const mapped = mapApiMessageToFrontend(rawMessage);

						draft.results.unshift(mapped);
					}
				}
			)
		);
	} else {
		logger.warn('⚠️ Could not determine queryUserUid', {
			chat_type: rawMessage.chat_type,
			chat_key: rawMessage.chat_key,
			fromUid,
			toUid,
			currentUserId
		});
	}
};

const getAccessToken = async (): Promise<string | null> => {
	try {
		const res = await fetch('/api/auth/getAccessToken', {
			method: 'GET',
			cache: 'no-store'
		});
		if (!res.ok) {
			return null;
		}
		const data = await res.json();
		return data.accessToken ?? null;
	} catch {
		return null;
	}
};

const ensureFreshToken = async (): Promise<string> => {
	if (currentToken && Date.now() < tokenExpiry) {
		return currentToken;
	}
	const token = await getAccessToken();
	if (!token) {
		throw new Error('No token');
	}
	currentToken = token;
	tokenExpiry = Date.now() + 9 * 60 * 1000;
	return token;
};

export const setupSocket = async (): Promise<WebSocket> => {
	if (abortController) {
		abortController.abort();
	}
	abortController = new AbortController();

	const token = await ensureFreshToken();

	if (isSocketInitialized && socket?.readyState === WebSocket.OPEN) {
		return socket;
	}

	if (isConnecting) {
		return await connectPromise!;
	}

	if (socket && socket.readyState === WebSocket.CONNECTING) {
		socket.close();
	}

	connectPromise = new Promise((resolve, reject) => {
		isConnecting = true;
		const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?authorization=${encodeURIComponent(token)}`;
		socket = new WebSocket(wsUrl);

		socket.onopen = () => {
			if (abortController?.signal.aborted) {
				socket?.close();
				return;
			}

			isSocketInitialized = true;
			reconnectAttempts = 0;
			socket!.onmessage = event => {
				try {
					const response: WSResponse = JSON.parse(event.data);

					const pendingCb = pendingRequests.get(response.request_uid);
					if (pendingCb) {
						pendingCb(response);
						pendingRequests.delete(response.request_uid);
						return;
					}

					handleIncomingMessage(response);

					subscribers.get(response.action)?.forEach(cb => cb(response));
				} catch (err) {
					logger.error('❌ WS onmessage error:', err);
				}
			};

			isConnecting = false;
			connectPromise = null;
			resolve(socket!);
		};

		socket.onerror = () => {
			isConnecting = false;
			connectPromise = null;
			socket = null;
			logger.error('WS connection failed');
			reject(new Error('WS connection failed'));

			if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
				reconnectAttempts++;
				setTimeout(() => {
					setupSocket();
				}, RECONNECT_DELAY * reconnectAttempts);
			}
		};

		socket.onclose = e => {
			if (socket && socket.readyState !== WebSocket.OPEN) {
				socket = null;
			}
			if (e.code !== 1000) {
				isSocketInitialized = false;
			}

			if (e.code === 4001 || e.code === 4003) {
				logger.warn('🔐 Auth error on WS, logging out');
				if (wsDispatch) {
					wsDispatch(authActions.logout());
				}
				isSocketInitialized = false;
				return;
			}

			if (e.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
				reconnectAttempts++;
				setTimeout(() => setupSocket(), RECONNECT_DELAY * reconnectAttempts);
			}

			pendingRequests.forEach((rejectCb, uid) => {
				rejectCb({
					request_uid: uid,
					action: 'error',
					status: 'error'
				} as WSResponse);
			});
			pendingRequests.clear();
			subscribers.clear();
			isConnecting = false;
			connectPromise = null;
			if (e.code !== 1000) {
				reject(new Error(`WS closed: ${e.code}`));
			}
		};
	});

	return connectPromise;
};

export const subscribeWS = <T = WSResponse>(
	action: string,
	callback: (data: T) => void
): (() => void) => {
	if (!subscribers.has(action)) {
		subscribers.set(action, new Set());
	}
	subscribers.get(action)!.add(callback as (data: WSResponse) => void);
	return () => {
		subscribers.get(action)?.delete(callback as (data: WSResponse) => void);
		if (subscribers.get(action)?.size === 0) {
			subscribers.delete(action);
		}
	};
};

export const sendWS = async <T = WSResponse>(
	request: WSRequest
): Promise<T | undefined> => {
	try {
		const ws = await setupSocket();
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			throw new Error('WS not connected');
		}
		return new Promise((resolve, reject) => {
			const requestUid = request.request_uid ?? crypto.randomUUID();
			const requestWithUid = { ...request, request_uid: requestUid };
			pendingRequests.set(requestUid, resolve as (res: WSResponse) => void);
			ws.send(JSON.stringify(requestWithUid));
			const timeoutId = setTimeout(() => {
				if (pendingRequests.has(requestUid)) {
					pendingRequests.delete(requestUid);
					reject(new Error(`Timeout: ${request.action}`));
				}
			}, 10000);
			const originalResolve = pendingRequests.get(requestUid);
			if (originalResolve) {
				pendingRequests.set(requestUid, (res: WSResponse) => {
					clearTimeout(timeoutId);
					originalResolve(res);
				});
			}
		});
	} catch (error) {
		throw error;
	}
};

export const disconnectWS = () => {
	socket?.close();
	socket = null;
	currentToken = null;
	isSocketInitialized = false;
	abortController?.abort();
	abortController = null;
	subscribers.clear();
	pendingRequests.clear();
};

// export const connectChat = () => sendWS({ action: '_connect' });

// export const createTextMessageForChat = (chatKey: string, content: string) =>
// 	sendWS({
// 		action: 'create_text_message',
// 		object: { chat_key: chatKey, content }
// 	});

export const addMembersToChat = (chatKey: string, uids: string[]) =>
	sendWS({
		action: 'add_members_to_chat',
		object: { chat_key: chatKey, uid_users_list: uids }
	});
