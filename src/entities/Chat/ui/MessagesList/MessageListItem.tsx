import { memo } from 'react';
import { MessageBubble } from '@/entities/Chat/ui/MessageBubble/MessageBubble';
import { SmartDateSeparator } from '../SystemMessages/ui/SmartDateSeparator/SmartDateSeparator';
import SystemMessage from '../SystemMessages/ui/SystemMessages/SystemMessages';
import { classNames } from '@/shared/lib/classNames/classNames';
import { MessageListItem as MessageListItemType } from '../../model/lib/hooks/useMessagesData/useMessagesData';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { selectCurrentUserId } from '@/entities/Profile';

import cls from './MessagesList.module.scss';
interface Props {
	item: MessageListItemType;
	activeResultId?: string;
	searchQuery?: string;
	getActiveOccurrencesForMessage?: (messageId: string) => number[] | undefined;
}

export const MessageListItem = memo(
	({
		item,
		activeResultId,
		searchQuery,
		getActiveOccurrencesForMessage
	}: Props) => {
		const currentUserId = useAppSelector(selectCurrentUserId);

		if (item.type === 'separator') {
			return <SmartDateSeparator key={item.id} id={item.id} date={item.date} />;
		}

		if (item.type === 'system') {
			return <SystemMessage key={item.data.id} message={item.data} />;
		}

		const isActive = activeResultId === item.data.uid;
		const hasQuery = !!searchQuery?.trim();

		const className = classNames('', {
			[cls.messageBubble_active]: isActive,
			[cls.messageBubble_hasQuery]: hasQuery && !isActive
		});

		const isFromCurrentUser =
			!!currentUserId && item.data.senderId === currentUserId;
		const isNew = !!item.data.new;

		return (
			<MessageBubble
				key={item.data.uid}
				id={item.data.uid}
				text={item.data.text}
				time={item.data.createdAt}
				status={item.data.status}
				onClick={() => {}}
				className={className}
				data-message-id={item.data.uid}
				searchQuery={searchQuery}
				getActiveOccurrencesForMessage={getActiveOccurrencesForMessage}
				isFromCurrentUser={isFromCurrentUser}
				isNew={isNew}
			/>
		);
	}
);

MessageListItem.displayName = 'MessageListItem';
