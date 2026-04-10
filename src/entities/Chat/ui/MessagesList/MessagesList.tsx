'use client';

import { memo, useEffect } from 'react';
import { Down } from '@icons/index';
import { SmartDateSeparator } from '../SystemMessages/ui/SmartDateSeparator/SmartDateSeparator';
import { StickyDateProvider } from '../SystemMessages/ui/StickyDateContext/StickyDateContext';
import SystemMessage from '../SystemMessages/ui/SystemMessages/SystemMessages';
import { useMessagesData } from '../../model/lib/hooks/useMessagesData/useMessagesData';
import { useInfiniteScroll } from '../../model/lib/hooks/useInfiniteScroll/useInfiniteScroll';
import {
	SCROLL_BOTTOM_THRESHOLD,
	MESSAGES_QUERY_DEFAULTS
} from '@/shared/model';
import { useMessagePagination } from '../../model/lib/hooks/useMessagePagination/useMessagePagination';
import { MessageListItem } from './MessageListItem';

import cls from './MessagesList.module.scss';

interface MessagesProps {
	userUid: string;
	currentUserId?: string;
	className?: string;
	activeResultId?: string;
	searchQuery?: string;
	onContainerReady?: (container: HTMLDivElement | null) => void;
	onScrollContainerReady?: (container: HTMLDivElement | null) => void;
	getActiveOccurrencesForMessage?: (messageId: string) => number[] | undefined;
}

const MessagesListComponent = ({
	userUid,
	currentUserId,
	className,
	activeResultId,
	searchQuery,
	onContainerReady,
	getActiveOccurrencesForMessage,
	onScrollContainerReady
}: MessagesProps) => {
	const {
		messages,
		messagesWithSeparators,
		nextUrl,
		isLoading,
		isError,
		refetch,
		isEmpty
	} = useMessagesData({
		userUid,
		currentUserId,
		pageSize: MESSAGES_QUERY_DEFAULTS.page_size,
		ordering: MESSAGES_QUERY_DEFAULTS.ordering
	});

	const { loadMore, containerRef } = useMessagePagination(nextUrl);

	const {
		scrollRef,
		anchorRef,
		isAtBottom,
		newCount,
		scrollToBottom,
		incrementNewCount
	} = useInfiniteScroll({
		loadMore,
		threshold: SCROLL_BOTTOM_THRESHOLD,
		loadThreshold: SCROLL_BOTTOM_THRESHOLD
	});

	useEffect(() => {
		if (!isAtBottom && messages.length > 0) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage?.status === 'unread') {
				incrementNewCount();
			}
		}
	}, [messages, isAtBottom, incrementNewCount]);

	useEffect(() => {
		const timer = setTimeout(() => {
			const scrollContainer = scrollRef.current?.closest(
				'[data-scroll-container]'
			) as HTMLDivElement | null;
			onScrollContainerReady?.(scrollContainer);
			onContainerReady?.(scrollContainer);
		}, 100);
		return () => clearTimeout(timer);
	}, [onContainerReady, onScrollContainerReady, scrollRef]);

	useEffect(() => {
		if (messages.length > 0 && isAtBottom) {
			requestAnimationFrame(() => {
				scrollToBottom();
			});
		}
	}, [messages.length, isAtBottom, scrollToBottom]);

	if (isLoading && isEmpty) {
		return (
			<div className={cls.emptyState} role='status' aria-live='polite'>
				Загрузка сообщений...
			</div>
		);
	}

	if (isError) {
		return (
			<div className={cls.emptyState} role='alert'>
				<p>Ошибка загрузки сообщений</p>
				<button onClick={refetch}>Попробовать снова</button>
			</div>
		);
	}

	return (
		<StickyDateProvider
			containerRef={containerRef as React.RefObject<HTMLDivElement>}
			onScrollContainerReady={onScrollContainerReady}
		>
			<div className={`${cls.wrapper} ${className}`}>
				<div className={cls.messages} ref={scrollRef}>
					{messagesWithSeparators.map(item => {
						if (item.type === 'separator') {
							return (
								<SmartDateSeparator
									key={item.id}
									id={item.id}
									date={item.date}
								/>
							);
						}

						if (item.type === 'system') {
							return <SystemMessage key={item.data.id} message={item.data} />;
						}

						return (
							<MessageListItem
								key={item.data.uid}
								item={item}
								activeResultId={activeResultId}
								searchQuery={searchQuery}
								getActiveOccurrencesForMessage={getActiveOccurrencesForMessage}
							/>
						);
					})}
					<div ref={anchorRef} className={cls.scrollAnchor} />
				</div>

				{!isAtBottom && (
					<button
						className={cls.scrollButton}
						onClick={scrollToBottom}
						aria-label={`Прокрутить к новым сообщениям${newCount > 0 ? `, ${newCount} новых` : ''}`}
					>
						<Down />
						{newCount > 0 && <span aria-hidden='true'>({newCount})</span>}
					</button>
				)}
			</div>
		</StickyDateProvider>
	);
};

export const MessagesList = memo(MessagesListComponent);
