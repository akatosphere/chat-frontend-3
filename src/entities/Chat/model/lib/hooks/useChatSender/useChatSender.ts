import { chatApi } from '@/entities/Chat';
import { selectCurrentUserId } from '@/entities/Profile';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { useCallback } from 'react';
import {
	ChatType,
	VoiceFile,
	GetMessagesRequest,
	ChatMessage,
	MessageType
} from '../../../types/chat.types/chat.types';
import { sendMessage } from '../../service/sendMessage/sendMessage';

export const useChatSender = (
	chatUid: string,
	chatType: ChatType,
	chatKey?: string
) => {
	const currentUserId = useAppSelector(selectCurrentUserId);
	const dispatch = useAppDispatch();

	const send = useCallback(
		async (
			payload: { content?: string; files?: VoiceFile[] },
			queryArgs: GetMessagesRequest
		) => {
			if (!currentUserId || !chatUid) {
				return;
			}

			// Оптимистичное обновление (только для текстовых)
			if (payload.content) {
				const optimisticMsg: ChatMessage = {
					id: -1,
					uid: `temp_${Date.now()}`,
					from_user: currentUserId,
					content: payload.content,
					files_summary: { types: [], count: payload.files?.length ?? 0 },
					has_replied_message: false,
					has_forwarded_message: false,
					new: true,
					created_at: Math.floor(Date.now() / 1000),
					updated_at: Math.floor(Date.now() / 1000),
					type: MessageType.TEXT
				};

				dispatch(
					chatApi.util.updateQueryData('getMessages', queryArgs, draft => {
						draft.results.unshift(optimisticMsg);
					})
				);
			}

			await sendMessage(chatUid, chatType, payload, currentUserId, chatKey);

			// Инвалидация только для голосовых (если нужно)
			if (!payload.content && payload.files?.length) {
				dispatch(
					chatApi.util.invalidateTags([{ type: 'Messages', id: 'LIST' }])
				);
			}
		},
		[chatUid, chatType, chatKey, currentUserId, dispatch]
	);

	return { send };
};
