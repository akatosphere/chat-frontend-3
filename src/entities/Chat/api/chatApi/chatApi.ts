import { rtkApi } from '@/shared/api/rtkApi';
import {
	Chat,
	ChatListResponse,
	GetChatsRequest,
	GetMessagesRequest,
	MessageListResponse,
	RawMessageListResponse,
	UpdateChatPropertiesRequest,
	UpdateChatPropertiesResponse
} from '../../model/types/chat.types/chat.types';
import {
	CHATS_ORDERING,
	CHATS_PAGE_SIZE,
	MESSAGES_ORDERING,
	MESSAGES_PAGE_SIZE
} from '@/shared/model';
import { mapApiMessageToFrontend } from '../../model/mapper/mapChatType/chatMapper';

const chatApi = rtkApi.injectEndpoints({
	endpoints: build => ({
		getChats: build.query<ChatListResponse, GetChatsRequest | void>({
			query: query => {
				const params: Record<string, string | number | boolean | undefined> = {
					page_size: query?.pageSize ?? CHATS_PAGE_SIZE,
					ordering: query?.ordering ?? CHATS_ORDERING,
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

		getChatById: build.query<Chat, string>({
			query: chatUid => ({ url: `/chat/${chatUid}/`, method: 'GET' }),
			providesTags: (result, error, chatUid) => [{ type: 'Chats', id: chatUid }]
		}),

		getMessages: build.query<MessageListResponse, GetMessagesRequest>({
			query: args => {
				const pageSize = args.page_size ?? MESSAGES_PAGE_SIZE ?? 50;
				return {
					url: `/chat/message/text/${args.user_uid}/`,
					params: {
						page_size: pageSize,
						ordering: args.ordering ?? MESSAGES_ORDERING ?? '-created_at',
						page: args.page ?? 1,
						search: args.search?.trim() || undefined
					},
					method: 'GET'
				};
			},
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
			): MessageListResponse => {
				return {
					...response,
					results: response.results.map(mapApiMessageToFrontend)
				};
			}
		}),

		deleteChat: build.mutation({
			query: (id: number) => ({ url: `/chat/list/${id}/`, method: 'DELETE' }),
			invalidatesTags: ['Chats']
		}),

		updateChatProperties: build.mutation<
			UpdateChatPropertiesResponse,
			{ id: number } & Partial<UpdateChatPropertiesRequest>
		>({
			query: ({ id, ...body }) => ({
				url: `/chat/list/${id}/`,
				method: 'POST',
				body
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Chats', id }]
		}),

		markChatLastSeen: build.mutation<
			void,
			{ id: number; last_seen_message: string }
		>({
			query: ({ id, last_seen_message }) => ({
				url: `/chat/list/${id}/`,
				method: 'POST',
				body: { last_seen_message }
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Chats', id },
				{ type: 'Chats', id: 'LIST' }
			]
		})
	}),
	overrideExisting: false
});

export const {
	useGetChatsQuery,
	useLazyGetChatsQuery,
	useGetChatByIdQuery,
	useGetMessagesQuery,
	useLazyGetMessagesQuery,
	useDeleteChatMutation,
	useUpdateChatPropertiesMutation,
	useMarkChatLastSeenMutation,
	endpoints: { getChats, getChatById, getMessages }
} = chatApi;

export { chatApi };
