export {
	useGetChatsQuery,
	useLazyGetChatsQuery,
	useGetChatByIdQuery,
	useGetMessagesQuery,
	useLazyGetMessagesQuery,
	useDeleteChatMutation,
	useUpdateChatPropertiesMutation
} from './chatApi/chatApi';

export { getChats, getChatById, getMessages } from './chatApi/chatApi';

export { chatApi } from './chatApi/chatApi';

export {
	markMessagesAsRead,
	addMembersToChat
} from './ws/chatActions/chatActions';

export type { ChangeStatusReadResponse } from '@/shared/api/WS/types/wsTypes';

export type {
	Chat,
	ChatListResponse,
	GetChatsRequest,
	GetMessagesRequest,
	MessageListResponse,
	UpdateChatPropertiesRequest,
	UpdateChatPropertiesResponse
} from '../model/types/chat.types/chat.types';
