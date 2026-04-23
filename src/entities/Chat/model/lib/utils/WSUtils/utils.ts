import type { Draft } from 'immer';
import type { MessageListResponse, ChatListResponse } from '@/entities/Chat';
import type { RawApiChatMessage } from '@/entities/Chat';
import { MessageStatus } from '@/entities/Chat';
import { mapApiMessageToFrontend } from '@/entities/Chat/model/mapper/mapChatType/chatMapper';

export const extractUid = (
	value: string | { uid?: string } | null | undefined
): string | undefined => {
	if (typeof value === 'string') {
		return value || undefined;
	}
	if (value && typeof value === 'object' && 'uid' in value) {
		return value.uid || undefined;
	}
	return undefined;
};

export const updateMessagesCache = (
	draft: Draft<MessageListResponse> | undefined,
	rawMessage: RawApiChatMessage,
	currentUserId: string | null
) => {
	if (!draft?.results) {
		return;
	}
	const mapped = mapApiMessageToFrontend(rawMessage);
	if (!draft.results.some(m => m.uid === mapped.uid)) {
		draft.results.unshift(mapped);
	}
};

export const updateChatInList = (
	draft: Draft<ChatListResponse> | undefined,
	rawMessage: RawApiChatMessage,
	currentUserId: string | null
) => {
	if (!draft?.results) {
		return;
	}

	const fromUid = extractUid(rawMessage.from_user);
	const toUid = extractUid(rawMessage.to_user);

	if (!fromUid) {
		return;
	}

	const queryUserUid =
		rawMessage.chat_type === 'chat' || !rawMessage.chat_key
			? toUid && toUid !== currentUserId
				? toUid
				: fromUid && fromUid !== currentUserId
					? fromUid
					: undefined
			: rawMessage.chat_key;

	if (!queryUserUid) {
		return;
	}

	const chat = draft.results.find(
		c => c.chat_key === rawMessage.chat_key || c.chat.uid === queryUserUid
	);
	if (!chat) {
		return;
	}

	const isSentByMe = currentUserId && fromUid === currentUserId;

	chat.last_message = {
		id: rawMessage.id,
		uid: rawMessage.uid,
		from_user: fromUid,
		content: rawMessage.content,
		files_summary: rawMessage.files_list?.length
			? {
					types: rawMessage.files_list
						.map(f => f.file_type)
						.filter((t): t is string => typeof t === 'string')
						.slice(0, 3),
					count: rawMessage.files_list.length
				}
			: { types: [], count: 0 },
		has_replied_message: rawMessage.replied_messages?.length > 0,
		has_forwarded_message: rawMessage.forwarded_messages?.length > 0,
		new: !isSentByMe && rawMessage.new,
		created_at: new Date(rawMessage.created_at).getTime(),
		updated_at: new Date(rawMessage.updated_at).getTime(),

		status: isSentByMe ? MessageStatus.READ : MessageStatus.RECEIVED
	};

	if (!isSentByMe && rawMessage.new) {
		chat.new_message_count = (chat.new_message_count || 0) + 1;
	}
	chat.last_activity_at = new Date(rawMessage.created_at).getTime();
};
