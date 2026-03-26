import { Chat } from '@/entities/Chat';

export const sortChatsByLastMessage = (chats: Chat[]): Chat[] => {
	return [...chats].sort((a, b) => {
		const aUnread = (a.new_message_count ?? 0) > 0;
		const bUnread = (b.new_message_count ?? 0) > 0;

		if (aUnread && !bUnread) {
			return -1;
		}
		if (!aUnread && bUnread) {
			return 1;
		}

		const hasMessage = (chat: Chat): boolean => !!chat.last_message?.content;
		const aHasMsg = hasMessage(a);
		const bHasMsg = hasMessage(b);

		if (aHasMsg && !bHasMsg) {
			return -1;
		}
		if (!aHasMsg && bHasMsg) {
			return 1;
		}

		const getTime = (chat: Chat): number => {
			if (chat.last_message?.updated_at) {
				return chat.last_message.updated_at;
			}
			if (chat.last_message?.created_at) {
				return chat.last_message.created_at;
			}
			return chat.last_activity_at ?? 0;
		};

		const timeA = getTime(a);
		const timeB = getTime(b);

		return timeB - timeA;
	});
};
