'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { AuthSyncProvider, authActions } from '@/features/auth';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';
import { persistor, store } from '../config/store';

import { tokenManager } from '@/shared/lib/tokenManager/tokenManager';

import {
	disconnectChatWS,
	initChatWS,
	registerChatWSHandlers,
	setChatWSCurrentUserId
} from '@/entities/Chat/api/ws/chatWS/chatWS';

import {
	initWSHandlers,
	setWSCurrentUserId,
	setupSocket,
	disconnectWS
} from '@/shared/api';

import { logger } from '@/shared/lib/logger/logger';

interface StoreProviderProps {
	children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
	const isWsInitialized = useRef(false);
	const unregisterChatHandlers = useRef<(() => void) | null>(null);

	const dispatch = store.dispatch;

	useEffect(() => {
		tokenManager.initialize().catch(err => {
			if (err.message === 'TOKEN_EXPIRED') {
				logger.log('[StoreProvider] Token expired, redirecting to login');
				dispatch(authActions.logout());
				return;
			}
			logger.warn('[StoreProvider] TokenManager init failed:', err);
		});

		initWSHandlers(store.dispatch);
		initChatWS(store.dispatch);

		unregisterChatHandlers.current = registerChatWSHandlers();

		const unsubscribe = store.subscribe(() => {
			const userId = selectCurrentUserId(store.getState());
			setWSCurrentUserId(userId);
			setChatWSCurrentUserId(userId);
		});

		const initialState = store.getState();
		const userId = selectCurrentUserId(initialState);
		const hasValidToken = tokenManager.hasValidToken?.() ?? false;

		if (!isWsInitialized.current && userId && hasValidToken) {
			setupSocket().catch(err => {
				if (
					err.message !== 'No valid token' &&
					err.message !== 'TOKEN_EXPIRED' &&
					err.message !== 'Refresh failed'
				) {
					logger.warn('[StoreProvider] WS connect failed:', err);
				}
			});
			isWsInitialized.current = true;
		}

		return () => {
			unsubscribe();
			unregisterChatHandlers.current?.();
			disconnectWS();
			disconnectChatWS();
			tokenManager.logout();
			isWsInitialized.current = false;
		};
	}, [dispatch]);

	useEffect(() => {
		const initAuth = async () => {
			try {
				await tokenManager.initialize();
			} catch (error) {
				logger.error(
					`[StoreProvider] Token initialization failed, continuing without token  ${error}`
				);
			}
		};

		initAuth();
	}, []);

	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<AuthSyncProvider>{children}</AuthSyncProvider>
			</PersistGate>
		</Provider>
	);
}
