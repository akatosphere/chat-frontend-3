import { selectCurrentUserId } from '@/entities/Profile';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { useCallback } from 'react';
import {
	ChatType,
	VoiceFile,
	GetMessagesRequest,
	ChatMessage,
	MessageType,
	MessageListResponse,
	GetChatsRequest,
	ChatListResponse
} from '../../../types/chat.types/chat.types';
import { sendMessage } from '../../service/sendMessage/sendMessage';
import { chatApi } from '@/entities/Chat/api';

export const useChatSender = (
	chatUid: string,
	chatType: ChatType,
	chatKey?: string,
	chatsQueryArgs?: GetChatsRequest
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

			const tempUid = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
			const now = Math.floor(Date.now() / 1000);

			if (payload.content) {
				const optimisticMsg: ChatMessage = {
					id: -1,
					uid: tempUid,
					from_user: currentUserId,
					content: payload.content,
					files_summary: { types: [], count: payload.files?.length ?? 0 },
					has_replied_message: false,
					has_forwarded_message: false,
					new: true,
					created_at: now,
					updated_at: now,
					type: MessageType.TEXT
				};

				dispatch(
					chatApi.util.updateQueryData(
						'getMessages',
						queryArgs,
						(draft: MessageListResponse) => {
							draft.results.unshift(optimisticMsg);
						}
					)
				);

				if (chatsQueryArgs) {
					dispatch(
						chatApi.util.updateQueryData(
							'getChats',
							chatsQueryArgs,
							(draft: ChatListResponse) => {
								if (!draft?.results) {
									return;
								}

								const chatIndex = draft.results.findIndex(
									c => c.chat.uid === chatUid
								);
								if (chatIndex === -1) {
									return;
								}

								const chat = draft.results[chatIndex];

								draft.results[chatIndex] = {
									...chat,
									last_message: {
										uid: tempUid,
										content: payload.content ?? '',
										created_at: now,
										updated_at: now,
										from_user: currentUserId
									} as ChatMessage,
									last_activity_at: now,
									new_message_count: 0
								};

								draft.results.sort(
									(a, b) => b.last_activity_at - a.last_activity_at
								);
							}
						)
					);
				}
			}

			try {
				dispatch(chatApi.util.invalidateTags([{ type: 'Chats', id: 'LIST' }]));

				await sendMessage(chatUid, chatType, payload, currentUserId, chatKey);

				if (!payload.content && payload.files?.length) {
					dispatch(
						chatApi.util.invalidateTags([{ type: 'Messages', id: 'LIST' }])
					);
				}
			} catch (error) {
				if (payload.content) {
					dispatch(
						chatApi.util.updateQueryData(
							'getMessages',
							queryArgs,
							(draft: MessageListResponse) => {
								draft.results = draft.results.filter(
									(m: ChatMessage) => m.uid !== tempUid
								);
							}
						)
					);
				}
				throw error;
			}
		},
		[chatUid, chatType, chatKey, chatsQueryArgs, currentUserId, dispatch]
	);

	return { send };
};
