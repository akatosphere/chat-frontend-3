import type {
	Chat,
	ChatMessage,
	RawApiChatMessage,
	SystemEventData,
	SystemMessageData
} from '../../types/chat.types/chat.types';
import type { IUserCard } from '@/shared/ui/UserCard';
import {
	ChatType,
	MessageType,
	SystemEventType,
	ChatType as UserCardChatType
} from '../../types/chat.types/chat.types';

const mapChatType = (type: string): UserCardChatType | undefined => {
	switch (type) {
		case ChatType.CHAT:
			return UserCardChatType.CHAT;
		case ChatType.PUBLIC_GROUP:
			return UserCardChatType.PUBLIC_GROUP;
		case ChatType.PRIVATE_GROUP:
			return UserCardChatType.PRIVATE_GROUP;
		case ChatType.PUBLIC_CHANNEL:
			return UserCardChatType.PUBLIC_CHANNEL;
		case ChatType.PRIVATE_CHANNEL:
			return UserCardChatType.PRIVATE_CHANNEL;
		case ChatType.GROUP:
			return UserCardChatType.GROUP;
		case ChatType.CHANNEL:
			return UserCardChatType.CHANNEL;
		default:
			return undefined;
	}
};

const mapLastMessage = (
	message: ChatMessage | null
): IUserCard['last_message'] => {
	if (!message) {
		return undefined;
	}

	return {
		id: message.id,
		uid: message.uid,
		from_user: message.from_user,
		content: message.content,
		files_summary: message.files_summary
			? {
					types: message.files_summary.types,
					count: message.files_summary.count
				}
			: { types: [], count: 0 },
		has_replied_message: message.has_replied_message,
		has_forwarded_message: message.has_forwarded_message,
		new: message.new,
		created_at: message.created_at,
		updated_at: message.updated_at
	};
};

export const mapChatToUserCard = (chat: Chat): IUserCard => {
	const chatData = chat.chat;
	const chatName = chat.name || '';

	let firstName = '';
	let lastName = '';
	let nickname = chatName;

	if (!chat.is_group) {
		firstName = chatData.first_name || '';
		lastName = chatData.last_name || '';
		nickname = chatData.nickname || chatName;
	} else {
		firstName = chatName;
		lastName = '';
		nickname = chatName;
	}

	return {
		user: {
			uid: chatData.uid,
			username: chatData.username || undefined,
			nickname: nickname,
			first_name: firstName,
			last_name: lastName,
			avatar: chatData.avatar_url || undefined,
			avatar_url: chatData.avatar_url || undefined,
			avatar_webp: chatData.avatar_webp_url || undefined,
			avatar_webp_url: chatData.avatar_webp_url || undefined,
			is_online: chatData.is_online,
			was_online_at: chatData.was_online_at || undefined
		},
		notifications: chat.notifications,
		new_message_count: chat.new_message_count,
		chat_type: mapChatType(chat.chat_type),
		chat_key: chat.chat_key,
		last_message: chat.last_message
			? mapLastMessage(chat.last_message)
			: undefined
	};
};

export const mapApiMessageToFrontend = (
	apiMsg: RawApiChatMessage
): ChatMessage => ({
	id: apiMsg.id,
	uid: apiMsg.uid,
	from_user: apiMsg.from_user?.uid ?? '',
	content: apiMsg.content,
	files_summary: apiMsg.files_list?.length
		? {
				types: [...new Set(apiMsg.files_list.map(f => f.file_type))].slice(
					0,
					3
				),
				count: apiMsg.files_list.length
			}
		: { types: [], count: 0 },
	has_replied_message: apiMsg.replied_messages?.length > 0,
	has_forwarded_message: apiMsg.forwarded_messages?.length > 0,
	new: apiMsg.new ?? false,

	created_at: new Date(apiMsg.created_at).getTime(),
	updated_at: new Date(apiMsg.updated_at).getTime()
});

export const mapApiMessagesList = (
	apiResults: readonly RawApiChatMessage[]
): ChatMessage[] => apiResults.map(mapApiMessageToFrontend);

export const mapChatMessageToSystemMessageData = (
	msg: ChatMessage
): SystemMessageData => {
	let eventType: SystemEventType = SystemEventType.CHAT_CREATED;
	let eventData: SystemEventData = {
		type: SystemEventType.CHAT_CREATED,
		payload: {
			name: 'Чат',
			ownerFullName: msg.from_user
		}
	};
	let displayText: string | undefined;

	try {
		const parsed = JSON.parse(msg.content) as {
			eventType?: SystemEventType;
			eventData?: { payload: Record<string, unknown> };
			text?: string;
		};

		if (parsed.eventType && parsed.eventData?.payload) {
			eventType = parsed.eventType;

			eventData = {
				type: eventType,
				payload: parsed.eventData.payload
			} as SystemEventData;
		}

		if (parsed.text) {
			displayText = parsed.text;
		}
	} catch {
		displayText = msg.content || undefined;
	}

	return {
		id: String(msg.id),

		type: MessageType.SYSTEM,
		createdAt: msg.created_at,
		eventType,
		eventData,
		displayText
	};
};

export const isSystemMessageType = (
	msg: ChatMessage
): msg is ChatMessage & { type: typeof MessageType.SYSTEM } => {
	return msg.type === MessageType.SYSTEM;
};
