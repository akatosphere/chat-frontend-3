import { rtkApi } from '@/shared/api/rtkApi';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/app/providers/StoreProvider';
import { mapApiMessageToFrontend } from '../model/mapper/mapChatType/chatMapper';
import type {
	Chat,
	ChatListResponse,
	GetChatsRequest,
	MessageListResponse,
	RawMessageListResponse,
	GetMessagesRequest
} from '../model/types/chat.types/chat.types';

// ─────────────────────────────────────────────────────────────
//  RTK QUERY API
// ─────────────────────────────────────────────────────────────

export const chatApi = rtkApi.injectEndpoints({
	endpoints: build => ({
		// ─── Список чатов ───────────────────────────────────────
		getChats: build.query<ChatListResponse, GetChatsRequest | void>({
			query: query => {
				const params: Record<string, string | number | boolean | undefined> = {
					page_size: query?.pageSize ?? 30,
					ordering: query?.ordering ?? '-last_activity_at',
					page: query?.page,
					search: query?.search?.trim() || undefined,
					is_active: query?.isActive,
					is_blocked: query?.isBlocked,
					is_favorite: query?.isFavorite
				};

				Object.keys(params).forEach(key => {
					if (params[key] === undefined) {
						delete params[key];
					}
				});

				return { url: '/chat/list/', params, method: 'GET' };
			},
			providesTags: result =>
				result
					? [
							...result.results.map(({ id }) => ({
								type: 'Chats' as const,
								id
							})),
							{ type: 'Chats', id: 'LIST' }
						]
					: [{ type: 'Chats', id: 'LIST' }],
			keepUnusedDataFor: 60
		}),

		// ─── Один чат по UID ────────────────────────────────────
		getChatById: build.query<Chat, string>({
			query: chatUid => ({
				url: `/chat/${chatUid}/`,
				method: 'GET'
			}),
			providesTags: (result, error, chatUid) => [{ type: 'Chats', id: chatUid }]
		}),

		// ─── Сообщения чата (НОВЫЙ эндпоинт) ────────────────────
		getMessages: build.query<MessageListResponse, GetMessagesRequest>({
			query: ({ user_uid, ...params }) => ({
				url: `/chat/message/text/${user_uid}/`,
				params: {
					page_size: 30,
					ordering: '-created_at',
					...params
				},
				method: 'GET'
			}),
			providesTags: result =>
				result
					? [
							...result.results.map(({ uid }) => ({
								type: 'Messages' as const,
								id: uid
							})),
							{ type: 'Messages', id: 'LIST' }
						]
					: [{ type: 'Messages', id: 'LIST' }],
			keepUnusedDataFor: 30,

			transformResponse: (
				response: RawMessageListResponse
			): MessageListResponse => ({
				...response,
				results: response.results.map(mapApiMessageToFrontend)
			})
		})
	}),
	overrideExisting: false
});

// ─────────────────────────────────────────────────────────────
//  ЭКСПОРТЫ ХУКОВ
// ─────────────────────────────────────────────────────────────

export const {
	useGetChatsQuery,
	useLazyGetChatsQuery,
	useGetChatByIdQuery,
	useGetMessagesQuery,
	useLazyGetMessagesQuery,
	endpoints: { getChats, getChatById, getMessages }
} = chatApi;

// ─────────────────────────────────────────────────────────────
//  СЕЛЕКТОРЫ
// ─────────────────────────────────────────────────────────────

export const selectChatByUid = createSelector(
	[(state: RootState) => state, (_: RootState, chatUid: string) => chatUid],
	(state, chatUid) => {
		const chatsData = chatApi.endpoints.getChats.select({
			pageSize: 30,
			ordering: '-last_activity_at'
		})(state);

		return chatsData.data?.results?.find(
			(chat: Chat) => chat.chat.uid === chatUid
		);
	}
);
