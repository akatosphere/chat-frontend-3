import { logger } from '@/shared/lib/logger/logger';
import { ChatPreviewData } from '../../../types/chat.types/chat.types';
import { getErrorMessage } from '@/shared/lib/errorMessage/errorMessage';

export const getPreviewData = (uid: string | undefined): ChatPreviewData => {
	if (!uid) {
		return {};
	}

	const SESSION_KEY = `chat_preview_data_${uid}`;
	const LOCAL_KEY = `chat_preview_${uid}`;

	try {
		const sessionRaw = sessionStorage.getItem(SESSION_KEY);
		if (sessionRaw) {
			return JSON.parse(sessionRaw) as ChatPreviewData;
		}

		const localRaw = localStorage.getItem(LOCAL_KEY);
		if (localRaw) {
			sessionStorage.setItem(SESSION_KEY, localRaw);
			localStorage.removeItem(LOCAL_KEY);

			return JSON.parse(localRaw) as ChatPreviewData;
		}
	} catch (err: unknown) {
		logger.error('Preview parse error', {
			category: 'ui',
			prefix: getErrorMessage(err)
		});
	}

	return {};
};
