'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
	CheckCircle,
	CopyMessage,
	Down,
	Reply,
	Send,
	Trash
} from '@icons/index';
import { SmartDateSeparator } from '../SystemMessages/ui/SmartDateSeparator/SmartDateSeparator';
import { StickyDateProvider } from '../SystemMessages/ui/StickyDateContext/StickyDateContext';
import SystemMessage from '../SystemMessages/ui/SystemMessages/SystemMessages';
import { useMessagesData } from '../../model/lib/hooks/useMessagesData/useMessagesData';
import { useInfiniteScroll } from '../../model/lib/hooks/useInfiniteScroll/useInfiniteScroll';
import {
	SCROLL_BOTTOM_THRESHOLD,
	MESSAGES_QUERY_DEFAULTS,
	CHATS_QUERY_DEFAULTS
} from '@/shared/model';
import { useMessagePagination } from '../../model/lib/hooks/useMessagePagination/useMessagePagination';
import { MessageListItem } from '../MessageListItem/MessageListItem';
import { useMessageReadTracker } from '../../model/lib/hooks/useMessageReadTracker/useMessageReadTracker';
import { ContextMenu, useContextMenu } from '@/features/contextMenu';
import { KebabMenuItem } from '@/shared/ui/KebabMenu';
import { mapRawMessagesToListItems } from '../../model/mapper/mapChatType/chatMapper';
import { MessageListItem as MessageListItemType } from '../../model/lib/hooks/useMessagesData/useMessagesData';
import { shouldShowDateSeparator } from '../../model/lib/service/dateFormating/dateFormater';
import { PaginationLoader } from '@/shared/ui/PaginationLoader/PaginationLoader';
import { Text, TextColor, TextSize } from '@/shared/ui/Text';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { chatApi } from '../../api/chatApi/chatApi';

import cls from './MessagesList.module.scss';
interface MessagesProps {
	userUid: string;
	currentUserId?: string;
	chatKey: string;
	className?: string;
	activeResultId?: string;
	searchQuery?: string;
	chatId: number;
	backendNewCount?: number;
	onContainerReady?: (container: HTMLDivElement | null) => void;
	onScrollContainerReady?: (container: HTMLDivElement | null) => void;
	getActiveOccurrencesForMessage?: (messageId: string) => number[] | undefined;
}

const MessagesListComponent = ({
	userUid,
	currentUserId,
	chatKey,
	className,
	activeResultId,
	searchQuery,
	chatId,
	backendNewCount,
	onContainerReady,
	getActiveOccurrencesForMessage,
	onScrollContainerReady
}: MessagesProps) => {
	const { messages, nextUrl, isLoading, isError, refetch, isEmpty } =
		useMessagesData({
			userUid,
			currentUserId,
			pageSize: MESSAGES_QUERY_DEFAULTS.page_size,
			ordering: MESSAGES_QUERY_DEFAULTS.ordering
		});

	const [isPaginationLoading, setIsPaginationLoading] = useState(false);
	const [isPaginationEnded, setIsPaginationEnded] = useState(false);
	const [paginationNextUrl, setPaginationNextUrl] = useState<string | null>(
		null
	);

	const [extraRawItems, setExtraRawItems] = useState<MessageListItemType[]>([]);

	const dispatch = useAppDispatch();

	const effectiveNextUrl = useMemo(() => {
		if (isPaginationEnded) {
			return null;
		}
		return paginationNextUrl ?? nextUrl;
	}, [paginationNextUrl, nextUrl, isPaginationEnded]);

	const hasMore = useMemo(
		() => !!effectiveNextUrl && !isPaginationEnded,
		[effectiveNextUrl, isPaginationEnded]
	);
	const { loadMore, containerRef } = useMessagePagination(
		effectiveNextUrl,
		currentUserId,
		(rawMessages, newNextUrl) => {
			const mapped = mapRawMessagesToListItems(rawMessages, currentUserId);

			setExtraRawItems(prev => {
				const getItemUid = (item: MessageListItemType): string | undefined => {
					if (item.type === 'text') {
						return item.data.uid;
					}
					if (item.type === 'system') {
						return item.data.id;
					}
					return undefined;
				};

				const existingUids = new Set(
					prev.map(getItemUid).filter((uid): uid is string => uid !== undefined)
				);

				const unique = mapped.filter(m => {
					const uid = getItemUid(m);
					return uid !== undefined && !existingUids.has(uid);
				});

				return [...unique, ...prev];
			});

			if (newNextUrl) {
				setPaginationNextUrl(newNextUrl);
			} else {
				setPaginationNextUrl(null);
				setIsPaginationEnded(true);
			}
		}
	);

	const handleLoadMore = useCallback(async () => {
		if (!effectiveNextUrl || isPaginationLoading) {
			return;
		}
		setIsPaginationLoading(true);
		try {
			await loadMore();
		} finally {
			setIsPaginationLoading(false);
		}
	}, [loadMore, isPaginationLoading, effectiveNextUrl]);

	const allMessages = useMemo((): MessageListItemType[] => {
		const wrappedMessages: MessageListItemType[] = messages.map(msg => ({
			type: 'text' as const,
			data: msg
		}));

		return [...extraRawItems, ...wrappedMessages];
	}, [extraRawItems, messages]);

	const allItemsWithSeparators = useMemo(() => {
		if (allMessages.length === 0) {
			return [];
		}

		const textMessages = allMessages.filter(m => m.type === 'text');
		const lastTextMessageUid =
			textMessages.length > 0
				? textMessages[textMessages.length - 1].data.uid
				: null;

		const result: MessageListItemType[] = [];

		for (let i = 0; i < allMessages.length; i++) {
			const item = allMessages[i];
			const prevItem = i > 0 ? allMessages[i - 1] : undefined;

			if (item.type === 'system') {
				result.push(item);
				continue;
			}

			if (item.type === 'text') {
				const currDateMs = item.data.createdAt;
				const prevDateMs =
					prevItem?.type === 'text' ? prevItem.data.createdAt : undefined;

				const needsSep = shouldShowDateSeparator(currDateMs, prevDateMs);

				if (needsSep) {
					const dateObj = new Date(currDateMs);

					const isoDate = dateObj.toISOString().split('T')[0];

					result.push({
						type: 'separator',
						date: dateObj,
						id: `sep-${isoDate}-${currDateMs}`
					});
				}

				result.push({
					...item,
					isLastInChat: item.data.uid === lastTextMessageUid
				} as MessageListItemType);
			}
		}

		return result;
	}, [allMessages]);

	const {
		scrollRef,
		anchorRef,
		isAtBottom,
		scrollToBottom,
		incrementNewCount
	} = useInfiniteScroll({
		loadMore: handleLoadMore,
		threshold: SCROLL_BOTTOM_THRESHOLD,
		loadThreshold: SCROLL_BOTTOM_THRESHOLD
	});

	useMessageReadTracker({
		containerRef: scrollRef,
		queryArgs: {
			user_uid: userUid,
			page_size: MESSAGES_QUERY_DEFAULTS.page_size,
			ordering: MESSAGES_QUERY_DEFAULTS.ordering
		},
		chatId: chatId,
		chatKey
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
		if (messages.length > 0 && isAtBottom) {
			requestAnimationFrame(() => scrollToBottom());
		}
	}, [messages.length, isAtBottom, scrollToBottom]);

	useEffect(() => {
		const timer = setTimeout(() => {
			onScrollContainerReady?.(scrollRef.current);
			onContainerReady?.(scrollRef.current);
		}, 100);
		return () => clearTimeout(timer);
	}, [onContainerReady, onScrollContainerReady, scrollRef]);

	const [activeContextMessageId, setActiveContextMessageId] =
		useState<string>('');

	const allVisibleTextMessages = useMemo(() => {
		const fromExtra = extraRawItems
			.filter(
				(m): m is MessageListItemType & { type: 'text' } => m.type === 'text'
			)
			.map(m => m.data);
		return [...fromExtra, ...messages];
	}, [extraRawItems, messages]);

	const getContextItems = useCallback(
		(messageId: string): KebabMenuItem[] => {
			return [
				{
					text: 'Ответить',
					icon: <Reply />,
					onClick: async () => console.log(`Reply ${messageId}`)
				},
				{
					text: 'Переслать',
					icon: <Send />,
					onClick: async () => console.log(`Forward ${messageId}`)
				},
				{
					text: 'Скопировать',
					icon: <CopyMessage />,
					onClick: async () => {
						try {
							const msg = allVisibleTextMessages.find(m => m.uid === messageId);
							if (msg?.text) {
								await navigator.clipboard.writeText(msg.text);
							}
						} catch (err) {
							console.error('Failed to copy:', err);
						}
					}
				},
				{
					text: 'Выбрать',
					icon: <CheckCircle />,
					onClick: async () => console.log(`Select ${messageId}`)
				},
				{
					text: 'Удалить',
					icon: <Trash />,
					onClick: async () => console.log(`Delete ${messageId}`),
					danger: true
				}
			];
		},
		[allVisibleTextMessages]
	);

	const unreadIncomingCount = useMemo(() => {
		return allMessages.filter(msg => {
			if (msg.type !== 'text') {
				return false;
			}

			const isOwn = msg.data.senderId === currentUserId;
			if (isOwn) {
				return false;
			}

			return msg.data.new === true;
		}).length;
	}, [allMessages, currentUserId]);

	const displayNewCount =
		backendNewCount !== undefined ? backendNewCount : unreadIncomingCount;

	const handleScrollToBottom = useCallback(() => {
		scrollToBottom();
		if (displayNewCount > 0) {
			dispatch(
				chatApi.util.updateQueryData(
					'getChats',
					CHATS_QUERY_DEFAULTS,
					draft => {
						const chat = draft?.results?.find(
							c =>
								c.id === chatId ||
								c.chat_key === chatKey ||
								c.chat.uid === chatKey
						);
						if (chat) {
							chat.new_message_count = 0;
							chat.first_new_message = null;
						}
					}
				)
			);
		}
	}, [scrollToBottom, displayNewCount, dispatch, chatId, chatKey]);

	const hideContext = useCallback(() => setActiveContextMessageId(''), []);
	const { handleContextMenu, isVisible, position, items } =
		useContextMenu(hideContext);

	const handleMessageContextMenu = useCallback(
		(e: React.MouseEvent, messageId: string, menuItems: KebabMenuItem[]) => {
			setActiveContextMessageId(messageId);
			handleContextMenu(e, menuItems);
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
			scrollContainerRef={scrollRef}
			onScrollContainerReady={onScrollContainerReady}
		>
			<div className={`${cls.wrapper} ${className}`}>
				<div className={cls.messages} ref={scrollRef}>
					<PaginationLoader
						isLoading={isPaginationLoading && hasMore}
						className={cls.paginationLoader}
					/>
					{isPaginationEnded && extraRawItems.length > 0 && (
						<div className={cls.endOfChat} role='status'>
							<Text fontSize={TextSize.XS} color={TextColor.GRAY}>
								Все сообщения загружены
							</Text>
						</div>
					)}

					{allItemsWithSeparators.map(item => {
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
								isLastInChat={
									'isLastInChat' in item ? item.isLastInChat : false
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
						onClick={handleScrollToBottom}
						aria-label={`Прокрутить к новым сообщениям${displayNewCount > 0 ? `, ${displayNewCount} новых` : ''}`}
					>
						<Down />
						{displayNewCount > 0 && (
							<span aria-hidden='true'>({displayNewCount})</span>
						)}
					</button>
				)}
			</div>
		</StickyDateProvider>
	);
};

export const MessagesList = memo(MessagesListComponent);
