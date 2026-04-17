import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/app/providers/StoreProvider';
import type { Chat } from '../../model/types/chat.types/chat.types';
import { CHATS_ORDERING, CHATS_PAGE_SIZE } from '@/shared/model';
import { chatApi } from '../chatApi/chatApi';

export const selectChatByUid = createSelector(
	[(state: RootState) => state, (_: RootState, chatUid: string) => chatUid],
	(state, chatUid) => {
		const chatsData = chatApi.endpoints.getChats.select({
			pageSize: CHATS_PAGE_SIZE,
			ordering: CHATS_ORDERING
		})(state);
		return chatsData.data?.results?.find(
			(chat: Chat) => chat.chat?.uid === chatUid || chat.chat_key === chatUid
		);
	}
);
