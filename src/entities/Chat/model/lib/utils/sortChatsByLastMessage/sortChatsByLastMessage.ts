import { Chat } from '@/entities/Chat';

export const sortChatsByLastMessage = (chats: Chat[]): Chat[] => {
	return [...chats].sort((a, b) => {
		// ─── Получаем время активности для каждого чата ───
		const getTime = (chat: Chat): number => {
			// Приоритет: updated_at → created_at → last_activity_at
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

		//  Сортируем СТРОГО по времени: новые сверху
		// Непрочитанные (new_message_count) НЕ влияют на позицию!
		return timeB - timeA;
	});
};
