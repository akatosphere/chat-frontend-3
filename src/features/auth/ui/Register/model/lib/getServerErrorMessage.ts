import { IRegister } from '@/features/auth/model/types/auth.types';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { UseFormSetError } from 'react-hook-form';

export const getServerErrorMessage = (
	err: FetchBaseQueryError | SerializedError,
	setResponseError: (message: string) => void,
	setError: UseFormSetError<IRegister>
) => {
	if ('status' in err && err.status === 400) {
		const errorData = err.data as Record<string, unknown>;
		Object.entries(errorData).forEach(([key, messages]) => {
			const message = Array.isArray(messages)
				? messages.join(', ')
				: String(messages);

			if (key === 'name') {
				setError('name', {
					type: 'server',
					message
				});
			} else if (key === 'detail' || key === 'nickname') {
				setError('nickname', {
					type: 'server',
					message
				});
			}
		});
	} else if ('originalStatus' in err && err?.originalStatus === 404) {
		setResponseError('Запрашиваемая страница не найдена.');
	} else if ('status' in err && err.status === 500) {
		setResponseError('Ошибка соединения с сервером. Попробуйте позже.');
	} else {
		setResponseError('Произошла непредвиденная ошибка. Попробуйте позже.');
	}
};
