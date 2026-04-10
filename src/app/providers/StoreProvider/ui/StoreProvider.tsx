'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthSyncProvider } from '@/features/auth';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';
import { persistor, store } from '..';
import { initWSHandlers, setWSCurrentUserId } from '@/shared/api';

interface StoreProviderProps {
	children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
	const isWsInitialized = useRef(false);

	useEffect(() => {
		const unsubscribe = store.subscribe(() => {
			const userId = selectCurrentUserId(store.getState());
			if (userId) {
				setWSCurrentUserId(userId);
			}
		});

		if (!isWsInitialized.current) {
			initWSHandlers(store.dispatch);
			isWsInitialized.current = true;
		}

		return unsubscribe;
	}, []);

	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<AuthSyncProvider>{children}</AuthSyncProvider>
			</PersistGate>
		</Provider>
	);
}
