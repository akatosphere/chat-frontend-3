import { useMemo } from 'react'; // ✅ useState и useEffect больше не нужны для messages
import {
	ChatMessage,
	MessageStatus,
	MessageType,
	SystemMessageData,
	TextMessage
} from '../../../types/chat.types/chat.types';
import {
	isSystemMessageType,
	mapChatMessageToSystemMessageData
} from '../../../mapper/mapChatType/chatMapper';
import { shouldShowDateSeparator } from '../../service/dateFormating/dateFormater';
import { useGetMessagesQuery } from '@/entities/Chat/api/chatApi';
import { MESSAGES_QUERY_DEFAULTS } from '@/shared/model';
import { MessageOrdering } from '../../../../../../shared/model/constants/chat.constants';

export type MessageListItem =
	| { type: 'text'; data: TextMessage }
	| { type: 'system'; data: SystemMessageData }
	| { type: 'separator'; date: Date; id: string };

export interface UseMessagesDataOptions {
	userUid: string;
	currentUserId?: string;
	pageSize?: number;
	ordering?: string;
	skip?: boolean;
}

export interface UseMessagesDataReturn {
	messages: TextMessage[];
	messagesWithSeparators: MessageListItem[];
	nextUrl: string | null;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	refetch: () => void;
	hasMore: boolean;
	isEmpty: boolean;
}

const toLocalTextMessage = (
	msg: ChatMessage,
	currentUserId?: string
): TextMessage => {
	const fromUserUid =
		typeof msg.from_user === 'string' ? msg.from_user : msg.from_user?.uid;
	const isSentByMe = currentUserId ? fromUserUid === currentUserId : false;

	return {
		id: String(msg.id),
		uid: msg.uid || '',

		type: MessageType.TEXT,
		createdAt: msg.created_at,

		content: msg.content,
		text: msg.content,
		senderId: fromUserUid || '',
		senderName: '',
		status: isSentByMe
			? msg.new
				? MessageStatus.UNREAD
				: MessageStatus.READ
			: MessageStatus.RECEIVED
	};
};

export const useMessagesData = ({
	userUid,
	currentUserId,
	pageSize = MESSAGES_QUERY_DEFAULTS.page_size,
	ordering = MESSAGES_QUERY_DEFAULTS.ordering,
	skip = false
}: UseMessagesDataOptions): UseMessagesDataReturn => {
	const {
		data: response,
		isLoading,
		isError,
		error,
		refetch
	} = useGetMessagesQuery(
		{
			user_uid: userUid,
			page_size: pageSize,
			ordering: ordering as MessageOrdering
		},
		{ skip: skip || !userUid }
	);

	const textMessages = useMemo((): TextMessage[] => {
		if (!response?.results) {
			return [];
		}

		return response.results
			.filter((msg): msg is ChatMessage => !isSystemMessageType(msg))
			.map(msg => toLocalTextMessage(msg, currentUserId));
	}, [response, currentUserId]);

	const messages = useMemo((): TextMessage[] => {
		return [...textMessages].reverse();
	}, [textMessages]);

	const messagesWithSeparators = useMemo((): MessageListItem[] => {
		if (!response?.results?.length) {
			return [];
		}
		const result: MessageListItem[] = [];

		const chronologicalResults = [...response.results].reverse();

		chronologicalResults.forEach((message: ChatMessage, index: number) => {
			const prevMessage =
				index > 0 ? chronologicalResults[index - 1] : undefined;

			if (isSystemMessageType(message)) {
				result.push({
					type: 'system',
					data: mapChatMessageToSystemMessageData(message)
				});
				return;
			}

			const createdAt = message.created_at;
			const prevCreatedAt =
				prevMessage && !isSystemMessageType(prevMessage)
					? prevMessage.created_at
					: undefined;

			if (shouldShowDateSeparator(createdAt, prevCreatedAt)) {
				result.push({
					type: 'separator',
					date: new Date(createdAt),
					id: `separator-${createdAt}-${index}`
				});
			}

			const mappedMsg = messages.find(m => m.uid === message.uid);
			if (mappedMsg) {
				result.push({
					type: 'text',
					data: mappedMsg
				});
			}
		});

		return result;
	}, [response, messages]);

	const nextUrl = useMemo(() => response?.next ?? null, [response?.next]);
	const hasMore = useMemo(() => !!nextUrl, [nextUrl]);
	const isEmpty = useMemo(
		() => messages.length === 0 && !isLoading,
		[messages.length, isLoading]
	);

	return {
		messages,
		messagesWithSeparators,
		nextUrl,
		isLoading,
		isError,
		error,
		refetch,
		hasMore,
		isEmpty
	};
};
