// features/auth/model/services/logoutUser.ts
import { AppDispatch } from '@/app/providers/StoreProvider/config/store';
import { authActions } from '../../slices/authSlice';
import { profileActions } from '@/entities/Profile';
import { localApi } from '@/shared/api/localApi';
import { rtkApi } from '@/shared/api/rtkApi';
import { disconnectChatWS } from '@/entities/Chat/api/ws/chatWS/chatWS';
import { tokenManager } from '@/shared/lib/tokenManager/tokenManager';
import { persistor } from '@/app/providers/StoreProvider/config/store';
import { disconnectWS } from '@/shared/api';
import { logger } from '@/shared/lib/logger/logger';

export interface LogoutOptions {
	skipRedirect?: boolean;
}

export const logoutUser = async (
	dispatch: AppDispatch,
	options?: LogoutOptions
) => {
	try {
		// 1. Вызываем эндпоинт для очистки куки на бэкенде
		await fetch('/api/v1/auth/logout/', {
			method: 'POST',
			credentials: 'include' //  Обязательно: браузер отправит куки
		});
	} catch (e) {
		// Если бэкенд недоступен — всё равно чистим локально
		logger.warn('[Auth] Logout endpoint failed, clearing locally anyway', e);
	} finally {
		// 2. Очищаем Redux стейт
		dispatch(authActions.logout());
		dispatch(profileActions.clearProfile());
		dispatch(rtkApi.util.resetApiState());
		dispatch(localApi.util.resetApiState());

		// 3. Отключаем WebSocket (главный и чат)
		disconnectWS();
		disconnectChatWS();

		// 4. Очищаем токен-менеджер
		tokenManager.logout();

		// 5. Очищаем persisted state (redux-persist)
		await persistor.purge();

		logger.log('[Auth] User logged out successfully');

		// 6. Редирект — только если не указан флаг skipRedirect
		if (!options?.skipRedirect) {
			// Внимание: здесь нет router.push, потому что эта функция может вызываться вне компонента
			// Редирект делает вызывающая сторона (хук или компонент)
		}
	}
};
