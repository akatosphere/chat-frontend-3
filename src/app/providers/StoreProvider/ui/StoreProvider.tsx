'use client';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthSyncProvider } from '@/features/auth';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';
import { persistor, store } from '..';
import { initWSHandlers, setupSocket, setWSCurrentUserId } from '@/shared/api';
import {
	initChatWS,
	registerChatWSHandlers,
	setChatWSCurrentUserId
} from '@/entities/Chat/api/ws/chatWS/chatWS';

interface StoreProviderProps {
	children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
	const isWsInitialized = useRef(false);
	const unregisterChatHandlers = useRef<(() => void) | null>(null);

	useEffect(() => {
		initWSHandlers(store.dispatch);

		initChatWS(store.dispatch);

		unregisterChatHandlers.current = registerChatWSHandlers();

		const unsubscribe = store.subscribe(() => {
			const userId = selectCurrentUserId(store.getState());
			setWSCurrentUserId(userId);
			setChatWSCurrentUserId(userId);
		});

		if (!isWsInitialized.current) {
			setupSocket();
			isWsInitialized.current = true;
		}

		return () => {
			unsubscribe();
			unregisterChatHandlers.current?.();
			// disconnectWS(); // опционально, если нужно явно рвать соединение
		};
	}, []);

	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<AuthSyncProvider>{children}</AuthSyncProvider>
			</PersistGate>
		</Provider>
	);
}
