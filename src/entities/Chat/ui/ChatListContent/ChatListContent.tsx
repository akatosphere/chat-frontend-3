import { memo, useMemo } from 'react';
import { ChatListItem } from '../ChatListItem/ChatListItem';
import { Chat } from '../../model/types/chat.types/chat.types';

import cls from './ChatListContent.module.scss';

// Вспомогательный компонент для рендера элемента списка
export const ChatListContent = memo(
	({
		chats,
		selectedChatUid
	}: {
		chats: Chat[];
		selectedChatUid?: string | null;
	}) => {
		const renderedItems = useMemo(
			() =>
				chats.map(chat => (
					<ChatListItem
						key={chat.id}
						chat={chat}
						isActive={selectedChatUid === chat.chat.uid}
					/>
				)),
			[chats, selectedChatUid]
		);

		return (
			<div className={cls.list} role='listbox' aria-multiselectable='false'>
				{renderedItems}
			</div>
		);
	}
);
ChatListContent.displayName = 'ChatListContent';
