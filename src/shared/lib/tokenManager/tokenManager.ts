import { logger } from '../logger/logger';
import { AuthResponse } from '../../api/WS/types/wsTypes';

type TokenSubscriber = (newToken: string) => void;

class TokenManager {
	private static instance: TokenManager;
	private accessToken: string | null = null;
	private tokenExpiry: number = 0;
	private refreshTimer: ReturnType<typeof setTimeout> | null = null;
	private isRefreshing = false;
	private refreshQueue: Array<{
		resolve: (token: string) => void;
		reject: (error: Error) => void;
	}> = [];
	private subscribers = new Set<TokenSubscriber>();

	private constructor() {}

	hasValidToken(): boolean {
		return !!this.accessToken && Date.now() < this.tokenExpiry;
	}

	static getInstance(): TokenManager {
		if (!TokenManager.instance) {
			TokenManager.instance = new TokenManager();
		}
		return TokenManager.instance;
	}

	subscribe(callback: TokenSubscriber): () => void {
		this.subscribers.add(callback);
		return () => this.subscribers.delete(callback);
	}

	private notifySubscribers(token: string) {
		this.subscribers.forEach(cb => {
			try {
				cb(token);
			} catch (e) {
				logger.error(`[TokenManager] Subscriber error:, ${e}`);
			}
		});
	}

	async getToken(): Promise<string> {
		if (this.accessToken && Date.now() < this.tokenExpiry - 60_000) {
			return this.accessToken;
		}

		if (this.isRefreshing) {
			return new Promise((resolve, reject) => {
				this.refreshQueue.push({ resolve, reject });
			});
		}

		return this.refreshToken();
	}

	private async refreshToken(): Promise<string> {
		this.isRefreshing = true;

		try {
			const response = await fetch('/api/proxy/auth/refresh', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				cache: 'no-store'
			});

			if (!response.ok) {
				let errorBody: string | null = null;
				try {
					const contentType = response.headers.get('content-type');
					if (contentType?.includes('application/json')) {
						const errData = await response.clone().json();
						errorBody = JSON.stringify(errData);
					} else {
						errorBody = await response.clone().text();
						if (errorBody.length > 200) {
							errorBody = errorBody.slice(0, 200) + '...';
						}
					}
				} catch {}

				logger.warn(
					`[TokenManager] Refresh failed: ${response.status}, ${{
						body: errorBody
					}}`
				);

				if (response.status === 401) {
					if (this.refreshTimer) {
						clearTimeout(this.refreshTimer);
						this.refreshTimer = null;
					}
					throw new Error('TOKEN_EXPIRED');
				}

				if (response.status >= 500 && response.status < 600) {
					throw new Error(`Server error: ${response.status}. Token preserved.`);
				}

				throw new Error(`Refresh failed: ${response.status}`);
			}

			let data: AuthResponse;
			try {
				data = await response.json();
			} catch (parseError: unknown) {
				const parseMessage =
					parseError instanceof Error ? parseError.message : 'Parse error';
				logger.error(
					`[TokenManager] Failed to parse refresh response:,
					${parseMessage}`
				);
				throw new Error('Invalid response format from server');
			}

			const getAccessToken = (obj: AuthResponse): string | null => {
				if (typeof obj.access === 'string') {
					return obj.access;
				}
				if (typeof obj.accessToken === 'string') {
					return obj.accessToken;
				}
				if (typeof obj.token === 'string') {
					return obj.token;
				}
				if (typeof obj.data?.access === 'string') {
					return obj.data.access;
				}
				return null;
			};

			const accessToken = getAccessToken(data);

			if (accessToken) {
				this.accessToken = accessToken;
				const expiresIn =
					typeof data.expiresIn === 'number'
						? data.expiresIn
						: typeof data.expires_in === 'number'
							? data.expires_in
							: typeof data.exp === 'number'
								? data.exp
								: 600;
				this.tokenExpiry = Date.now() + expiresIn * 1000 - 60_000;
			} else if (data.success === true) {
				const newToken = await this.fetchStoredToken();

				if (!newToken) {
					throw new Error('Refresh succeeded but getAccessToken returned null');
				}

				this.accessToken = newToken;
			} else {
				logger.error(`[TokenManager] Unknown refresh response format, {
				${{ responseKeys: Object.keys(data) }},
			${{ dataSample: JSON.stringify(data).slice(0, 200) }}
				}`);
				throw new Error('No access token in refresh response');
			}

			this.scheduleRefresh();
			this.notifySubscribers(this.accessToken!);

			this.refreshQueue.forEach(({ resolve }) => resolve(this.accessToken!));
			this.refreshQueue = [];

			return this.accessToken!;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			logger.error(`[TokenManager] Refresh error:, ${message}`);

			if (message.includes('Server error') && this.hasValidToken()) {
				logger.warn(
					'[TokenManager] Server error during refresh, keeping current token'
				);
				this.refreshQueue.forEach(({ resolve }) => resolve(this.accessToken!));
				this.refreshQueue = [];
				return this.accessToken!;
			}

			this.refreshQueue.forEach(({ reject }) => reject(error as Error));
			this.refreshQueue = [];

			const err = error instanceof Error ? error : new Error(message);
			throw err;
		} finally {
			this.isRefreshing = false;
		}
	}

	private scheduleRefresh() {
		if (!this.accessToken || this.tokenExpiry <= Date.now()) {
			return;
		}

		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
		}

		const timeUntilRefresh = Math.max(
			0,
			this.tokenExpiry - Date.now() - 60_000
		);

		this.refreshTimer = setTimeout(() => {
			this.refreshToken().catch(err => {
				if (err.message !== 'TOKEN_EXPIRED') {
					logger.warn('[TokenManager] Scheduled refresh failed:', err);
				}
			});
		}, timeUntilRefresh);
	}

	async handleAuthError(): Promise<boolean> {
		if (this.isRefreshing) {
			try {
				await new Promise<string>((resolve, reject) => {
					this.refreshQueue.push({ resolve, reject });
				});
				return true;
			} catch {
				return false;
			}
		}

		try {
			await this.refreshToken();
			return true;
		} catch {
			return false;
		}
	}

	setTokens(accessToken: string, refreshToken?: string, expiresIn = 600) {
		this.accessToken = accessToken;

		this.tokenExpiry = Date.now() + expiresIn * 1000 - 60_000;

		this.notifySubscribers(accessToken);

		this.scheduleRefresh();

		logger.info('[TokenManager] Tokens set successfully');
	}

	public getAccessToken(): string | null {
		return this.accessToken;
	}

	logout() {
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
		this.accessToken = null;
		this.tokenExpiry = 0;
		this.refreshQueue = [];
	}

	async initialize() {
		const token = await this.fetchStoredToken();
		if (token) {
			this.accessToken = token;

			if (Date.now() < this.tokenExpiry) {
				this.scheduleRefresh();
			}
		}
	}

	private async fetchStoredToken(): Promise<string | null> {
		try {
			const res = await fetch('/api/auth/getAccessToken', {
				cache: 'no-store',
				credentials: 'include'
			});

			if (!res.ok) {
				if (res.status === 401 || res.status === 404) {
					logger.info(
						'[TokenManager] No stored token (expected for new users)'
					);
				} else {
					logger.info(`[TokenManager] getAccessToken failed: ${res.status}`);
				}
				return null;
			}

			const contentType = res.headers.get('content-type');
			if (!contentType?.includes('application/json')) {
				logger.info(`[TokenManager] Expected JSON, got:, ${contentType}`);

				const text = await res.clone().text();
				if (
					text.startsWith('<!DOCTYPE') ||
					text.startsWith('<html') ||
					text.startsWith('<!doctype')
				) {
					logger.info(
						'[TokenManager] Received HTML page instead of JSON — check if endpoint exists'
					);
				} else if (text.length < 200) {
					logger.info(
						`[TokenManager] Response preview:, ${text.slice(0, 200)}`
					);
				}
				return null;
			}

			let data: AuthResponse;
			try {
				data = await res.json();
			} catch (parseError: unknown) {
				const parseMessage =
					parseError instanceof Error ? parseError.message : 'Parse error';
				logger.error(
					`[TokenManager] Failed to parse getAccessToken response:,
				${parseMessage}`
				);
				return null;
			}

			const accessToken =
				(typeof data.access === 'string' ? data.access : null) ??
				(typeof data.accessToken === 'string' ? data.accessToken : null) ??
				(typeof data.token === 'string' ? data.token : null) ??
				(typeof data.data?.access === 'string' ? data.data.access : null) ??
				null;

			if (!accessToken) {
				logger.warn(`[TokenManager] No valid access token in response, {
				${{ receivedKeys: Object.keys(data) }},
					${{ sample: JSON.stringify(data).slice(0, 150) }}
				}`);
				return null;
			}

			this.accessToken = accessToken;

			const expiresIn =
				(typeof data.expiresIn === 'number' ? data.expiresIn : null) ??
				(typeof data.expires_in === 'number' ? data.expires_in : null) ??
				(typeof data.exp === 'number' ? data.exp : null) ??
				600; // дефолт 10 минут

			this.tokenExpiry = Date.now() + expiresIn * 1000 - 60_000;

			logger.warn(`[TokenManager] Token loaded successfully, {
				${expiresIn},
			${{ expiresAt: new Date(this.tokenExpiry).toISOString() }}
			}`);

			return accessToken;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error';

			if (message.includes('Unexpected token') || message.includes('JSON')) {
				logger.info(
					'[TokenManager] No stored token found (expected on first visit)'
				);
			} else {
				logger.error(`[TokenManager] fetchStoredToken error:, ${message}`);
			}

			return null;
		}
	}
}

export const tokenManager = TokenManager.getInstance();
