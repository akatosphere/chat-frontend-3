import { profileReducer } from '@/entities/Profile';
import { authReducer } from '@/features/auth/model/slices/authSlice';
import { localApi } from '@/shared/api/localApi';
import { rtkApi } from '@/shared/api/rtkApi';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PersistConfig,
	persistReducer,
	persistStore,
	PURGE,
	REGISTER,
	REHYDRATE
} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { StateSchema } from './StateSchema';

const storage =
	typeof window !== 'undefined'
		? createWebStorage('local')
		: {
				getItem: () => Promise.resolve(null),
				setItem: () => Promise.resolve(),
				removeItem: () => Promise.resolve()
			};

const rootReducer = combineReducers({
	[rtkApi.reducerPath]: rtkApi.reducer,
	[localApi.reducerPath]: localApi.reducer,
	auth: authReducer,
	profile: profileReducer
});

const persistConfig: PersistConfig<StateSchema> = {
	key: 'root',
	storage,
	whitelist: ['auth', 'profile'],
	blacklist: [rtkApi.reducerPath, localApi.reducerPath],
	stateReconciler: autoMergeLevel2
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	devTools: process.env.NODE_ENV !== 'production',
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
			}
		}).concat(rtkApi.middleware, localApi.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
