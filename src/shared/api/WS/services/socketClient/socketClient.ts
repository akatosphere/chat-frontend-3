import type { AppDispatch } from '@/app/providers/StoreProvider/config/store';
import { WSRequest, type WSResponse } from '@/shared/api/WS/types/wsTypes';
import { logger } from '@/shared/lib/logger/logger';
import { authActions } from '@/features/auth';

let isConnecting = false;
let connectPromise: Promise<WebSocket> | null = null;
let socket: WebSocket | null = null;
let isSocketInitialized = false;
let abortController: AbortController | null = null;

let wsDispatch: AppDispatch | null = null;
let currentUserId: string | null = null;
let currentToken: string | null = null;
let tokenExpiry = 0;

const subscribers = new Map<string, Set<(data: WSResponse) => void>>();
const pendingRequests = new Map<string, (response: WSResponse) => void>();

type WSHandler = (response: WSResponse) => void;
const actionHandlers = new Map<string, Set<WSHandler>>();

export const initWSHandlers = (dispatch: AppDispatch) => {
	wsDispatch = dispatch;
};

export const setWSCurrentUserId = (userId: string | null) => {
	currentUserId = userId;
};

export const registerWSHandler = (
	action: string,
	handler: WSHandler
): (() => void) => {
	if (!actionHandlers.has(action)) {
		actionHandlers.set(action, new Set());
	}
	actionHandlers.get(action)!.add(handler);
	return () => {
		actionHandlers.get(action)?.delete(handler);
		if (actionHandlers.get(action)?.size === 0) {
			actionHandlers.delete(action);
		}
	};
};

const routeIncomingMessage = (response: WSResponse) => {
	const pendingCb = pendingRequests.get(response.request_uid);
	if (pendingCb) {
		pendingCb(response);
		pendingRequests.delete(response.request_uid);
		return;
	}

	const handlers = actionHandlers.get(response.action);
	if (handlers) {
		handlers.forEach(handler => {
			try {
				handler(response);
			} catch (err) {
				logger.error(`[WS] Handler error for ${response.action}:`, err);
			}
		});
	}

	subscribers.get(response.action)?.forEach(cb => {
		try {
			cb(response);
		} catch (err) {
			logger.error('[WS] Subscriber error:', err);
		}
	});
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

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
let reconnectAttempts = 0;

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
					routeIncomingMessage(response);
				} catch (err) {
					logger.error('WS onmessage error:', err);
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
				setTimeout(() => setupSocket(), RECONNECT_DELAY * reconnectAttempts);
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
				logger.warn('Auth error on WS, logging out');
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
			isConnecting = false;
			connectPromise = null;
			if (e.code !== 1000) {
				reject(new Error(`WS closed: ${e.code}`));
			}
		};
	});
	return connectPromise;
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
	actionHandlers.clear();
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
