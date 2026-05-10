import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';
import {
	GetMessagesRequest,
	MessageStatus
} from '../../../types/chat.types/chat.types';
import { CHATS_PAGE_SIZE, CHATS_ORDERING } from '@/shared/model';
import { logger } from '@/shared/lib/logger/logger';
import { chatApi } from '../../../../api/chatApi/chatApi';
import { markMessagesAsRead } from '../../../../api/ws/chatActions/chatActions';

const AUTO_READ_CONFIG = {
	THRESHOLD: 0.1,
	ROOT_MARGIN: '50px',
	BATCH_DELAY: 300
} as const;

interface UseMessageReadTrackerOptions {
	containerRef: React.RefObject<HTMLDivElement | null>;
	queryArgs: GetMessagesRequest | null;
	chatKey: string;
}

export const useMessageReadTracker = ({
	containerRef,
	queryArgs,
	chatKey
}: UseMessageReadTrackerOptions) => {
	const dispatch = useAppDispatch();
	const currentUserId = useAppSelector(selectCurrentUserId);

	const currentUserIdRef = useRef(currentUserId);
	const markedRef = useRef<Set<string>>(new Set());
	const batchQueueRef = useRef<{ uid: string; chatKey: string }[]>([]);
	const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		currentUserIdRef.current = currentUserId;
	}, [currentUserId]);

	const flushBatch = useCallback(async () => {
		if (batchQueueRef.current.length === 0) {
			return;
		}

		const batch = [...batchQueueRef.current];
		batchQueueRef.current = [];

		const userId = currentUserIdRef.current;
		if (!userId) {
			return;
		}

		const results = await Promise.allSettled(
			batch.map(({ uid, chatKey }) =>
				markMessagesAsRead([uid], userId, chatKey, false)
			)
		);

		const errors = results.filter(
			(r): r is PromiseRejectedResult => r.status === 'rejected'
		);

		if (errors.length > 0) {
			const errorMessages = errors
				.map(e =>
					e.reason instanceof Error ? e.reason.message : String(e.reason)
				)
				.join('; ');

			logger.warn('Ошибки при отправке read receipt', {
				category: 'ws',
				prefix: `${errors.length} из ${batch.length} - ${errorMessages}`
			});
		}
	}, []);

	const markAsRead = useCallback(
		(messageUids: string[]) => {
			const userId = currentUserIdRef.current;
			if (!userId || !queryArgs || messageUids.length === 0) {
				return;
			}

			const toMark = messageUids.filter(uid => {
				if (!uid || uid.startsWith('temp_') || markedRef.current.has(uid)) {
					return false;
				}
				markedRef.current.add(uid);
				return true;
			});

			if (toMark.length === 0) {
				return;
			}

			dispatch(
				chatApi.util.updateQueryData('getMessages', queryArgs, draft => {
					if (!draft?.results) {
						return;
					}
					toMark.forEach(uid => {
						const msg = draft.results.find(m => m.uid === uid);
						if (msg?.new === true) {
							msg.new = false;
							if ('status' in msg) {
								msg.status = MessageStatus.READ;
							}
						}
					});
				})
			);

			dispatch(
				chatApi.util.updateQueryData(
					'getChats',
					{ pageSize: CHATS_PAGE_SIZE, ordering: CHATS_ORDERING },
					draft => {
						if (!draft?.results) {
							return;
						}
						const chat = draft.results.find(
							c => c.chat_key === chatKey || c.chat?.uid === chatKey
						);
						if (!chat) {
							return;
						}

						if (chat.new_message_count > 0) {
							chat.new_message_count = Math.max(
								0,
								chat.new_message_count - toMark.length
							);
							if (chat.new_message_count === 0) {
								chat.first_new_message = null;
							}
						}

						if (
							chat.last_message?.uid &&
							toMark.includes(chat.last_message.uid)
						) {
							const isLastMsgSentByMe =
								userId && chat.last_message.from_user === userId;
							chat.last_message = {
								...chat.last_message,
								new: false,
								status: isLastMsgSentByMe
									? MessageStatus.READ
									: MessageStatus.RECEIVED
							};
						}
					}
				)
			);

			toMark.forEach(uid => {
				batchQueueRef.current.push({ uid, chatKey });
			});

			if (batchTimerRef.current) {
				clearTimeout(batchTimerRef.current);
			}
			batchTimerRef.current = setTimeout(() => {
				queueMicrotask(flushBatch);
			}, AUTO_READ_CONFIG.BATCH_DELAY);
		},
		[queryArgs, chatKey, dispatch, flushBatch]
	);

	useEffect(() => {
		const container = containerRef.current;
		const userId = currentUserIdRef.current;

		if (!container || !queryArgs || !userId || !chatKey) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				const visibleUids = entries
					.filter(entry => entry.isIntersecting)
					.map(entry => {
						const el = entry.target as HTMLElement;
						return el.dataset.messageId || '';
					})
					.filter(uid => {
						if (!uid || uid.startsWith('temp_')) {
							return false;
						}
						const el = container.querySelector(
							`[data-message-id="${uid}"]`
						) as HTMLElement | null;
						if (!el) {
							return false;
						}
						const isFromCurrentUser = el.dataset.isFromCurrentUser;
						const isNew = el.dataset.isNew;
						return (
							isFromCurrentUser !== 'true' &&
							isNew === 'true' &&
							!markedRef.current.has(uid)
						);
					});

				if (visibleUids.length > 0) {
					markAsRead(visibleUids);
				}
			},
			{
				root: container,
				rootMargin: AUTO_READ_CONFIG.ROOT_MARGIN,
				threshold: AUTO_READ_CONFIG.THRESHOLD
			}
		);

		const initObservers = () => {
			container
				.querySelectorAll('[data-message-id][data-is-new="true"]')
				.forEach(el => {
					const uid = el.getAttribute('data-message-id');
					if (uid && !uid.startsWith('temp_') && !markedRef.current.has(uid)) {
						observer.observe(el);
					}
				});
		};

		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(initObservers);
		});
		resizeObserver.observe(container);

		initObservers();

		return () => {
			observer.disconnect();
			resizeObserver.disconnect();
		};
	}, [containerRef, queryArgs, chatKey, markAsRead]);

	useEffect(() => {
		return () => {
			markedRef.current.clear();
			batchQueueRef.current = [];
			if (batchTimerRef.current) {
				clearTimeout(batchTimerRef.current);
				batchTimerRef.current = null;
			}
		};
	}, []);

	return {
		markAsRead,
		forceFlush: flushBatch
	};
};
