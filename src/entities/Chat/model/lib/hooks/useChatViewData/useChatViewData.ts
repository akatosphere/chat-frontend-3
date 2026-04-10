import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useChatHeaderData } from '../useChatHeaderData/useChatHeaderData';
import { useSafeHeaderData } from '../useSafeHeaderData/useSafeHeaderData';
import {
	selectChatByUid,
	useGetMessagesQuery
} from '@/entities/Chat/api/chatApi';
import {
	Chat,
	ChatMessage,
	UseChatViewDataOptions,
	UseChatViewDataReturn
} from '../../../types/chat.types/chat.types';
import { RootState } from '@/app/providers/StoreProvider';
import { MESSAGES_PAGE_SIZE, MESSAGES_ORDERING } from '@/shared/model';

export const useChatViewData = ({
	chatUid,
	userDataFromSearch,
	pageSize = MESSAGES_PAGE_SIZE,
	ordering = MESSAGES_ORDERING
}: UseChatViewDataOptions): UseChatViewDataReturn => {
	const chatDataFromCache = useSelector((state: RootState) =>
		selectChatByUid(state, chatUid)
	);

	const {
		data: messagesResponse,
		isLoading: isMessagesLoading,
		isError: isMessagesError,
		error: messagesError
	} = useGetMessagesQuery(
		{
			user_uid: chatUid,
			page_size: pageSize,
			ordering
		},
		{ skip: !chatUid }
	);

	const isForbidden = (messagesError as FetchBaseQueryError)?.status === 403;

	const messages = useMemo<ChatMessage[]>(() => {
		if (isForbidden) {
			return [];
		}
		return messagesResponse?.results ?? [];
	}, [messagesResponse, isForbidden]);

	const chatData = useMemo<Chat | null>(() => {
		return chatDataFromCache ?? null;
	}, [chatDataFromCache]);

	const { headerData: rawHeaderData, hasMessages } =
		useChatHeaderData(chatData);

	const safeHeaderData = useSafeHeaderData({
		chatUid,
		headerData: rawHeaderData,
		chatData,
		userDataFromSearch
	});

	const isLoading =
		isMessagesLoading && !chatData && messages.length === 0 && !isForbidden;
	const hasError = isMessagesError && !isForbidden;

	return {
		messages,
		chatData,
		headerData: safeHeaderData,
		hasMessages,
		isLoading,
		hasError,
		isForbidden,
		nextUrl: messagesResponse?.next ?? null
	};
};
