import { memo } from 'react';
import { MessageBubble } from '@/entities/Chat/ui/MessageBubble/MessageBubble';
import { SmartDateSeparator } from '../SystemMessages/ui/SmartDateSeparator/SmartDateSeparator';
import SystemMessage from '../SystemMessages/ui/SystemMessages/SystemMessages';
import { classNames } from '@/shared/lib/classNames/classNames';
import { MessageListItem as MessageListItemType } from '../../model/lib/hooks/useMessagesData/useMessagesData';
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

		return (
			<MessageBubble
				key={item.data.id}
				id={item.data.id}
				text={item.data.text}
				time={item.data.createdAt}
				status={item.data.status}
				onClick={() => {}}
				className={className}
				data-message-id={item.data.id}
				searchQuery={searchQuery}
				getActiveOccurrencesForMessage={getActiveOccurrencesForMessage}
			/>
		);
	}
);

MessageListItem.displayName = 'MessageListItem';
