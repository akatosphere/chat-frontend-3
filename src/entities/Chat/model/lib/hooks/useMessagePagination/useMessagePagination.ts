import { logger } from '@/shared/lib/logger/logger';
import { useRef, useCallback } from 'react';
import { ChatMessage } from '../../../types/chat.types/chat.types';
import { toProxyPath } from '../../service/toProxyPath/toProxyPath';

export const useMessagePagination = (
	nextUrl: string | null,
	currentUserId: string | undefined,
	onMessagesLoaded?: (
		messages: ChatMessage[],
		newNextUrl: string | null
	) => void
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

			const { results, next }: { results: ChatMessage[]; next: string | null } =
				await res.json();

			onMessagesLoaded?.(results, next);
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
