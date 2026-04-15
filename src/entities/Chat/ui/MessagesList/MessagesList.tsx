'use client';

import {
	MESSAGES_QUERY_DEFAULTS,
	SCROLL_BOTTOM_THRESHOLD
} from '@/shared/model';
import {
	CheckCircle,
	CopyMessage,
	Down,
	Reply,
	Send,
	Trash
} from '@icons/index';
import { memo, useCallback, useEffect, useState } from 'react';
import { useInfiniteScroll } from '../../model/lib/hooks/useInfiniteScroll/useInfiniteScroll';
import { useMessagePagination } from '../../model/lib/hooks/useMessagePagination/useMessagePagination';
import { useMessagesData } from '../../model/lib/hooks/useMessagesData/useMessagesData';
import { SmartDateSeparator } from '../SystemMessages/ui/SmartDateSeparator/SmartDateSeparator';
import { StickyDateProvider } from '../SystemMessages/ui/StickyDateContext/StickyDateContext';
import SystemMessage from '../SystemMessages/ui/SystemMessages/SystemMessages';
import { MessageListItem } from './MessageListItem';

import { ContextMenu, useContextMenu } from '@/features/contextMenu';
import { KebabMenuItem } from '@/shared/ui/KebabMenu';
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

	const [activeContextMessageId, setActiveContextMessageId] =
		useState<string>('');

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

	const getContextItems = useCallback((messageId: string): KebabMenuItem[] => {
		return [
			{
				text: 'Ответить',
				icon: <Reply />,
				onClick: async () => {
					console.log(`Reply ${messageId}`);
				}
			},
			{
				text: 'Переслать',
				icon: <Send />,
				onClick: async () => {
					console.log(`Forward ${messageId}`);
				}
			},
			{
				text: 'Скопировать',
				icon: <CopyMessage />,
				onClick: async () => {
					console.log(`Copy ${messageId}`);
				}
			},
			{
				text: 'Выбрать',
				icon: <CheckCircle />,
				onClick: async () => {
					console.log(`Select ${messageId}`);
				}
			},
			{
				text: 'Удалить',
				icon: <Trash />,
				onClick: async () => {
					console.log(`Delete ${messageId}`);
				},
				danger: true
			}
		];
	}, []);

	const hideContext = useCallback(() => {
		setActiveContextMessageId('');
	}, []);

	const { handleContextMenu, isVisible, position, items } =
		useContextMenu(hideContext);

	const handleMessageContextMenu = useCallback(
		(e: React.MouseEvent, messageId: string, items: KebabMenuItem[]) => {
			setActiveContextMessageId(messageId);
			handleContextMenu(e, items);
		},
		[handleContextMenu]
	);

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
								activeContextMessageId={activeContextMessageId}
								onContextMenu={e =>
									handleMessageContextMenu(
										e,
										item.data.uid,
										getContextItems(item.data.uid)
									)
								}
							/>
						);
					})}
					<div ref={anchorRef} className={cls.scrollAnchor} />
					<ContextMenu visible={isVisible} position={position} items={items} />
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
