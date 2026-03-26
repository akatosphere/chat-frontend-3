import { useMemo } from 'react';
import type { Chat } from '@/entities/Chat/model/types/chat.types/chat.types';

export const useChatHeaderData = (chatData: Chat | null | undefined) => {
	return useMemo(() => {
		// Ранний возврат
		if (!chatData) {
			return { headerData: null, hasMessages: false };
		}

		const { last_message, new_message_count, chat: userInfo } = chatData;

		//  Безопасное извлечение с дефолтами
		const {
			first_name = '',
			last_name = '',
			avatar_webp_url,
			avatar_url,
			is_online = false,
			was_online_at,
			is_in_contacts = false
		} = userInfo ?? {};

		// Гарантированно строка
		const userName =
			`${first_name} ${last_name}`.trim() || 'Неизвестный пользователь';

		const userStatus = is_online
			? 'В сети'
			: was_online_at
				? `был(а) ${new Date(was_online_at * 1000).toLocaleTimeString('ru-RU', {
						hour: '2-digit',
						minute: '2-digit'
					})}`
				: 'Не в сети';

		const userAvatar = avatar_webp_url || avatar_url || undefined;

		//  Проверка сообщений
		const hasMessages = checkHasMessages(last_message, new_message_count);

		return {
			headerData: {
				userName,
				userStatus,
				userAvatar,
				isOnline: is_online,
				isInContacts: is_in_contacts
			},
			hasMessages
		};
	}, [chatData]);
};

//  Вспомогательная функция (остается приватной в файле)
const checkHasMessages = (
	lastMessage: Chat['last_message'],
	newMessageCount: Chat['new_message_count']
): boolean => {
	if ((newMessageCount ?? 0) > 0) {
		return true;
	}
	if (!lastMessage) {
		return false;
	}
	if (lastMessage.id && lastMessage.id > 0) {
		return true;
	}
	if (lastMessage.uid?.trim()) {
		return true;
	}
	if (lastMessage.content?.trim()) {
		return true;
	}
	if (lastMessage.files_summary?.count) {
		return true;
	}
	return false;
};
