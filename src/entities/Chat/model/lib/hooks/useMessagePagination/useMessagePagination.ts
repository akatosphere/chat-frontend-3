import { logger } from '@/shared/lib/logger/logger';
import { useRef, useCallback } from 'react';
import { isSystemMessageType } from '../../../mapper/mapChatType/chatMapper';
import {
	ChatMessage,
	MessageStatus,
	MessageType,
	TextMessage
} from '../../../types/chat.types/chat.types';
import { toProxyPath } from '../../service/toProxyPath/toProxyPath';

export const useMessagePagination = (
	nextUrl: string | null,
	onMessagesLoaded?: (messages: TextMessage[]) => void
) => {
	const isFetchingMoreRef = useRef(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const loadMore = useCallback(async () => {
		if (!nextUrl || isFetchingMoreRef.current) {
			return;
		}

		isFetchingMoreRef.current = true;
		const controller = new AbortController();

		try {
			const fetchUrl = toProxyPath(nextUrl);
			if (!fetchUrl) {
				throw new Error('Invalid nextUrl');
			}
			const res = await fetch(fetchUrl, {
				signal: controller.signal,
				redirect: 'follow',
				credentials: 'include'
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const { results }: { results: ChatMessage[] } = await res.json();

			const older: TextMessage[] = results
				.filter((msg): msg is ChatMessage => !isSystemMessageType(msg))
				.map(msg => {
					// 🔹 Извлекаем senderId из from_user
					const senderId =
						typeof msg.from_user === 'string'
							? msg.from_user
							: msg.from_user?.uid || '';

					return {
						id: String(msg.id),
						uid: msg.uid || '',
						type: MessageType.TEXT,
						createdAt: msg.created_at,

						content: msg.content,
						text: msg.content,
						senderId,
						senderName: '',
						status: msg.new ? MessageStatus.UNREAD : MessageStatus.READ
					};
				});

			if (older.length > 0) {
				const el = containerRef.current?.closest(
					'[data-scroll-container]'
				) as HTMLDivElement | null;
				if (el) {
					const prevScrollHeight = el.scrollHeight;
					const prevScrollTop = el.scrollTop;
					requestAnimationFrame(() => {
						el.scrollTop = prevScrollTop + (el.scrollHeight - prevScrollHeight);
					});
				}
			}

			onMessagesLoaded?.(older);
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				return;
			}
			logger.error('Failed to load older messages:', err);
		} finally {
			isFetchingMoreRef.current = false;
		}
	}, [nextUrl, onMessagesLoaded]);

	return { loadMore, containerRef };
};
