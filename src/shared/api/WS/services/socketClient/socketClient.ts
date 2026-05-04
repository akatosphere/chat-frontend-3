import type { AppDispatch } from '@/app/providers/StoreProvider/config/store';
import { WSRequest, type WSResponse } from '@/shared/api/WS/types/wsTypes';
import { logger } from '@/shared/lib/logger/logger';
import { authActions } from '@/features/auth';
import { tokenManager } from '@/shared/lib/tokenManager/tokenManager';
import {
	getErrorMessage,
	isErrorWithMessage
} from '@/shared/lib/errorMessage/errorMessage';

let isConnecting = false;
let connectPromise: Promise<WebSocket> | null = null;
let socket: WebSocket | null = null;
let isSocketInitialized = false;
let abortController: AbortController | null = null;

let wsDispatch: AppDispatch | null = null;
let _currentUserId: string | null = null;

const subscribers = new Map<string, Set<(data: WSResponse) => void>>();
const pendingRequests = new Map<string, (response: WSResponse) => void>();
const retryableRequests = new Map<string, WSRequest>();

type WSHandler = (response: WSResponse) => void;
const actionHandlers = new Map<string, Set<WSHandler>>();

let tokenUnsubscribe: (() => void) | null = null;

const isAuthErrorResponse = (
	response: WSResponse
): response is WSResponse & { code: 401 | 4001 } => {
	const hasCode = 'code' in response && typeof response.code === 'number';
	if (!hasCode) {
		return false;
	}
	return (
		response.status === 'error' &&
		(response.code === 401 || response.code === 4001)
	);
};

const isRetryableAction = (action?: string): boolean => {
	if (!action) {
		return false;
	}
	const nonRetryable = ['unsubscribe', 'pong', 'ping', '_connect'];
	return !nonRetryable.includes(action);
};

const encodeTokenForUrl = (token: string | null | undefined): string => {
	if (!token || token === 'undefined' || token === 'null') {
		logger.error('[WS] Invalid token for URL encoding:', token);
		throw new Error('Invalid token');
	}
	return encodeURIComponent(token);
};

export const initWSHandlers = (dispatch: AppDispatch) => {
	wsDispatch = dispatch;

	if (!tokenUnsubscribe) {
		tokenUnsubscribe = tokenManager.subscribe(async newToken => {
			if (!newToken) {
				logger.warn('[WS] Received empty token, skipping reconnect');
				wsDispatch?.(authActions.logout());
				return;
			}
			reconnectWithNewToken(newToken).catch(err => {
				logger.error('[WS] Reconnect failed:', err);
			});
		});
	}
};

export const setWSCurrentUserId = (userId: string | null) => {
	_currentUserId = userId;
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

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
let reconnectAttempts = 0;

const reconnectWithNewToken = async (newToken: string) => {
	if (!newToken) {
		logger.error('[WS] Reconnect aborted: newToken is empty');
		wsDispatch?.(authActions.logout());
		return;
	}

	if (!socket || socket.readyState === WebSocket.CLOSED) {
		await setupSocket();
		return;
	}

	// const pendingUids = Array.from(pendingRequests.keys());
	pendingRequests.clear();

	socket.onclose = null;
	socket.close(1000, 'Token refresh');

	abortController?.abort();
	abortController = new AbortController();
	isConnecting = true;

	let wsUrl: string;
	try {
		wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?authorization=${encodeTokenForUrl(newToken)}`;
	} catch (err) {
		logger.error('[WS] Failed to encode token for URL:', err);
		isConnecting = false;
		wsDispatch?.(authActions.logout());
		return;
	}

	const newSocket = new WebSocket(wsUrl);

	newSocket.onopen = () => {
		if (abortController?.signal.aborted) {
			newSocket.close();
			return;
		}

		socket = newSocket;
		isSocketInitialized = true;
		reconnectAttempts = 0;
		isConnecting = false;
		connectPromise = null;

		socket!.onmessage = event => {
			try {
				const response: WSResponse = JSON.parse(event.data);
				routeIncomingMessage(response);
			} catch (err) {
				logger.error('WS onmessage error:', err);
			}
		};

		socket!.onclose = e => {
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
		};

		socket!.onerror = () => {
			logger.error('WS connection failed after token refresh');
			isConnecting = false;
			if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
				reconnectAttempts++;
				setTimeout(() => setupSocket(), RECONNECT_DELAY * reconnectAttempts);
			}
		};

		retryableRequests.forEach((req, uid) => {
			if (pendingRequests.has(uid) && socket?.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify(req));
			}
		});
	};

	newSocket.onerror = () => {
		logger.error('WS connection failed during token refresh reconnect');
		isConnecting = false;
		if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
			reconnectAttempts++;
			setTimeout(() => setupSocket(), RECONNECT_DELAY * reconnectAttempts);
		}
	};
};

export const setupSocket = async (): Promise<WebSocket> => {
	if (abortController) {
		abortController.abort();
	}
	abortController = new AbortController();

	let token: string | null = null;

	try {
		token = await tokenManager.getToken();
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';

		if (
			(errorMessage.includes('Server error') || errorMessage.includes('502')) &&
			tokenManager['accessToken'] &&
			tokenManager.hasValidToken()
		) {
			logger.warn('[WS] Server error during refresh, using current token');
			token = tokenManager['accessToken'];
		} else if (errorMessage === 'TOKEN_EXPIRED') {
			logger.warn('[WS] Token expired, cannot connect');
			wsDispatch?.(authActions.logout());
			throw new Error('Auth token expired');
		} else {
			logger.error('[WS] Failed to get token:', err);
			wsDispatch?.(authActions.logout());
			throw new Error(`No valid token: ${errorMessage}`);
		}
	}

	if (!token || token === 'undefined' || token === 'null') {
		logger.error('[WS] Cannot connect: token is empty or invalid', { token });
		disconnectWS();
		wsDispatch?.(authActions.logout());
		throw new Error('No valid token for WS connection');
	}

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

		let wsUrl: string;
		try {
			wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?authorization=${encodeTokenForUrl(token)}`;
		} catch (err: unknown) {
			logger.error('[WS] Failed to encode token for URL:', err);
			isConnecting = false;
			connectPromise = null;
			reject(new Error('Failed to encode token'));
			return;
		}

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
				} catch (err: unknown) {
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

			if (reconnectAttempts === 0 && MAX_RECONNECT_ATTEMPTS > 0) {
				reconnectAttempts++;
				setTimeout(() => {
					setupSocket().then(resolve).catch(reject);
				}, RECONNECT_DELAY);
			} else {
				reject(new Error('WS connection failed'));
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
				isConnecting = false;
				connectPromise = null;
				reject(new Error(`WS auth error: ${e.code}`));
				return;
			}

			if (e.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
				reconnectAttempts++;
				setTimeout(() => setupSocket(), RECONNECT_DELAY * reconnectAttempts);
				return;
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
	if (tokenUnsubscribe) {
		tokenUnsubscribe();
		tokenUnsubscribe = null;
	}

	socket?.close();
	socket = null;

	isSocketInitialized = false;
	abortController?.abort();
	abortController = null;
	subscribers.clear();
	pendingRequests.clear();
	retryableRequests.clear();
	actionHandlers.clear();
	reconnectAttempts = 0;
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
	request: WSRequest,
	options?: { timeout?: number }
): Promise<T | undefined> => {
	try {
		const ws = await setupSocket();
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			throw new Error('WS not connected');
		}

		const TIMEOUT = options?.timeout ?? 10_000;

		return new Promise((resolve, reject) => {
			const requestUid = request.request_uid ?? crypto.randomUUID();
			const requestWithUid = { ...request, request_uid: requestUid };

			pendingRequests.set(requestUid, resolve as (res: WSResponse) => void);

			if (isRetryableAction(request.action)) {
				retryableRequests.set(requestUid, requestWithUid);
			}

			ws.send(JSON.stringify(requestWithUid));

			const timeoutId = setTimeout(() => {
				if (pendingRequests.has(requestUid)) {
					pendingRequests.delete(requestUid);
					retryableRequests.delete(requestUid);
					reject(new Error(`Timeout: ${request.action} (${TIMEOUT}ms)`));
				}
			}, TIMEOUT);

			const originalResolve = pendingRequests.get(requestUid);
			if (originalResolve) {
				pendingRequests.set(requestUid, (res: WSResponse) => {
					clearTimeout(timeoutId);
					retryableRequests.delete(requestUid);

					if (isAuthErrorResponse(res)) {
						tokenManager
							.handleAuthError()
							.then(async success => {
								if (success && socket?.readyState === WebSocket.OPEN) {
									ws.send(JSON.stringify(requestWithUid));
									if (isRetryableAction(request.action)) {
										retryableRequests.set(requestUid, requestWithUid);
									}
								} else {
									wsDispatch?.(authActions.logout());
									reject(new Error('Auth failed'));
								}
							})
							.catch(() => {
								logger.warn('[WS] Auth error recovery failed, logging out');
								wsDispatch?.(authActions.logout());
								reject(new Error('Auth error'));
							});
					} else {
						originalResolve(res);
					}
				});
			}
		});
	} catch (error: unknown) {
		const errorMessage = getErrorMessage(error);

		if (isErrorWithMessage(error) && errorMessage.includes('token')) {
			wsDispatch?.(authActions.logout());
		}
		throw error;
	}
};
