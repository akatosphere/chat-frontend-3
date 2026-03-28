'use client';

import { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MessageBubble } from '@/entities/Chat/ui/MessageBubble/MessageBubble';
import { Down } from '@icons/index';
import { useGetMessagesQuery } from '@/entities/Chat/api/chatApi';
import { shouldShowDateSeparator } from '@/entities/Chat/model/lib/service/dateFormating/dateFormater';
import SmartDateSeparator from '../SystemMessages/ui/SmartDateSeparator/SmartDateSeparator';
import { StickyDateProvider } from '../SystemMessages/ui/StickyDateContext/StickyDateContext';
import SystemMessage from '../SystemMessages/ui/SystemMessages/SystemMessages';
import {
	SystemMessageData,
	ChatMessage
} from '../../model/types/chat.types/chat.types';
import {
	isSystemMessageType,
	mapChatMessageToSystemMessageData
} from '../../model/mapper/mapChatType/chatMapper';
import styles from './MessagesList.module.scss';

// ===== ТИПЫ =====

interface TextMessage {
	id: string;
	text: string;
	time: number;
	status: 'received' | 'sending' | 'unread' | 'read';
}

type MessageListItem =
	| { type: 'text'; data: TextMessage }
	| { type: 'system'; data: SystemMessageData }
	| { type: 'separator'; date: Date; id: string };

// Пропсы компонента
interface MessagesProps {
	userUid: string;
	className?: string;
}

const toLocalTextMessage = (msg: ChatMessage): TextMessage => ({
	id: String(msg.id),
	text: msg.content,
	time: msg.created_at,
	status: msg.new ? 'unread' : 'read'
});

//  Прокси для URL
const toProxyPath = (url: string | null): string | null => {
	if (!url) {
		return null;
	}
	if (url.startsWith('/api/proxy')) {
		return url;
	}

	try {
		const pathname = url.startsWith('http') ? new URL(url).pathname : url;
		const apiPath = pathname.replace(/^\/api\/v1/, '');
		return `/api/proxy${apiPath}`;
	} catch {
		return null;
	}
};

const MessagesListComponent = ({ userUid, className }: MessagesProps) => {
	// ===== API =====
	const { data, error, isLoading, refetch } = useGetMessagesQuery(
		{ user_uid: userUid },
		{ skip: !userUid }
	);

	// ===== REFS =====
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const isAtBottomRef = useRef(true);
	const isLoadingHistoryRef = useRef(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	// ===== STATE =====
	const [messages, setMessages] = useState<TextMessage[]>([]);
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [newCount, setNewCount] = useState(0);

	// ===== ОБРАБОТКА ДАННЫХ С БЭКА =====

	useEffect(() => {
		if (!data) {
			return;
		}

		const textMessages = data.results.filter(
			(msg): msg is ChatMessage => !isSystemMessageType(msg)
		);

		const mapped = textMessages.map(toLocalTextMessage);

		setNextUrl(data.next);

		setMessages(prev => {
			if (!prev.length) {
				return mapped;
			}
			const prevIds = new Set(prev.map(p => p.id));
			const incoming = mapped.filter(m => !prevIds.has(m.id));
			if (incoming.length) {
				if (!isLoadingHistoryRef.current && !isAtBottomRef.current) {
					setNewCount(c => c + incoming.length);
				}
				return [...prev, ...incoming];
			}
			return prev;
		});
	}, [data]);

	// ===== СКРОЛЛ =====
	const handleScroll = useCallback(() => {
		const el = containerRef.current;
		if (!el) {
			return;
		}

		const threshold = 50;
		const isBottom =
			el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

		isAtBottomRef.current = isBottom;
		setIsAtBottom(isBottom);

		if (isBottom) {
			setNewCount(0);
		}
		if (el.scrollTop < 50 && !isFetchingMore && !isLoadingHistoryRef.current) {
			loadMore();
		}
	}, [isFetchingMore]);

	// ===== АВТОСКРОЛЛ ВНИЗ =====
	useEffect(() => {
		if (
			!isLoadingHistoryRef.current &&
			isAtBottomRef.current &&
			messages.length > 0
		) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, isAtBottom]);

	// ===== ПОДГРУЗКА =====
	const loadMore = async () => {
		if (!nextUrl || isFetchingMore) {
			return;
		}

		isLoadingHistoryRef.current = true;
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();
		setIsFetchingMore(true);

		const el = containerRef.current;

		const saveScrollPosition = () => {
			if (!el) {
				return null;
			}
			return { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop };
		};

		try {
			const fetchUrl = toProxyPath(nextUrl);
			if (!fetchUrl) {
				throw new Error('Invalid nextUrl');
			}

			const res = await fetch(fetchUrl, {
				signal: abortControllerRef.current.signal,
				redirect: 'follow',
				credentials: 'include'
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const responseData: { results: ChatMessage[]; next: string | null } =
				await res.json();

			const older: TextMessage[] = responseData.results
				.filter(msg => !isSystemMessageType(msg))
				.map(toLocalTextMessage);

			setNextUrl(responseData.next);
			const scrollPos = saveScrollPosition();

			setMessages(prev => {
				const prevIds = new Set(prev.map(p => p.id));
				const uniqueOlder = older.filter(m => !prevIds.has(m.id));

				if (uniqueOlder.length > 0 && el && scrollPos) {
					requestAnimationFrame(() => {
						const newScrollHeight = el.scrollHeight;
						const heightDiff = newScrollHeight - scrollPos.scrollHeight;
						el.scrollTop = scrollPos.scrollTop + heightDiff;
					});
				}
				return [...uniqueOlder, ...prev];
			});
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				return;
			}
			console.error('Failed to load older messages:', err);
		} finally {
			setIsFetchingMore(false);
			isLoadingHistoryRef.current = false;
			abortControllerRef.current = null;
		}
	};

	// ===== CLEANUP =====
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	// ===== СКРОЛЛ ВНИЗ ВРУЧНУЮ =====
	const scrollToBottom = () => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		setNewCount(0);
	};

	// ===== ФОРМИРОВАНИЕ СПИСКА С РАЗДЕЛИТЕЛЯМИ И СИСТЕМНЫМИ СООБЩЕНИЯМИ =====

	const messagesWithSeparators = useMemo((): MessageListItem[] => {
		if (!data?.results?.length) {
			return [];
		}

		const result: MessageListItem[] = [];

		data.results.forEach((message, index) => {
			const prevMessage = index > 0 ? data.results[index - 1] : undefined;

			if (isSystemMessageType(message)) {
				result.push({
					type: 'system',
					data: mapChatMessageToSystemMessageData(message)
				});
				return;
			}

			const createdAt = message.created_at;
			const prevCreatedAt =
				prevMessage && !isSystemMessageType(prevMessage)
					? prevMessage.created_at
					: undefined;

			if (shouldShowDateSeparator(createdAt, prevCreatedAt)) {
				result.push({
					type: 'separator',
					date: new Date(createdAt),
					id: `separator-${createdAt}-${index}`
				});
			}

			result.push({
				type: 'text',
				data: toLocalTextMessage(message)
			});
		});

		return result;
	}, [data]);
	// ===== UI СОСТОЯНИЯ =====
	if (isLoading && messages.length === 0) {
		return <div className={styles.emptyState}>Загрузка сообщений...</div>;
	}

	if (error) {
		return (
			<div className={styles.emptyState}>
				<p>Ошибка загрузки сообщений</p>
				<button onClick={() => refetch()}>Попробовать снова</button>
			</div>
		);
	}

	// ===== РЕНДЕР =====

	return (
		<StickyDateProvider
			containerRef={containerRef as React.RefObject<HTMLDivElement>}
		>
			<div className={`${styles.wrapper} ${className}`}>
				<div
					ref={containerRef}
					onScroll={handleScroll}
					className={styles.messages}
				>
					{messagesWithSeparators.map(item => {
						// 🔹 Разделитель даты
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
							<MessageBubble
								key={item.data.id}
								id={item.data.id}
								text={item.data.text}
								time={item.data.time}
								status={item.data.status}
								onClick={() => {}}
							/>
						);
					})}
					<div ref={bottomRef} />
				</div>

				{!isAtBottom && (
					<button
						className={styles.scrollButton}
						onClick={scrollToBottom}
						aria-label='Прокрутить к новым сообщениям'
					>
						<Down />
						{newCount > 0 && <span>({newCount})</span>}
					</button>
				)}
			</div>
		</StickyDateProvider>
	);
};

export const MessagesList = memo(MessagesListComponent);
