import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';
import {
	GetMessagesRequest,
	MessageStatus,
	ChatMessage
} from '../../../types/chat.types/chat.types';
import { CHATS_PAGE_SIZE, CHATS_ORDERING } from '@/shared/model';
import { logger } from '@/shared/lib/logger/logger';
import { chatApi, markMessagesAsRead } from '@/entities/Chat/api';

const AUTO_READ_CONFIG = {
	THRESHOLD: 0.1,
	ROOT_MARGIN: '50px',
	BATCH_DELAY: 300
};

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

	const markedRef = useRef<Set<string>>(new Set());
	const batchQueueRef = useRef<{ uid: string; chatKey: string }[]>([]);
	const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

	const flushBatch = useCallback(async () => {
		if (batchQueueRef.current.length === 0) {
			return;
		}

		const batch = [...batchQueueRef.current];
		batchQueueRef.current = [];

		const results = await Promise.allSettled(
			batch.map(({ uid, chatKey }) =>
				markMessagesAsRead([uid], currentUserId!, chatKey, false)
			)
		);

		const errors = results.filter(
			(r): r is PromiseRejectedResult => r.status === 'rejected'
		);
		if (errors.length > 0) {
			logger.warn(
				`Ошибки при отправке read receipt: ${errors.length} из ${batch.length}`,
				errors
			);
		}
	}, [currentUserId]);

	const markAsRead = useCallback(
		(messageUids: string[]) => {
			if (!currentUserId || !queryArgs || messageUids.length === 0) {
				return;
			}

			const toMark = messageUids.filter(uid => {
				if (markedRef.current.has(uid) || uid.startsWith('temp_')) {
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
						const msg = draft.results.find((m: ChatMessage) => m.uid === uid);
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
							c => c.chat_key === chatKey || c.chat.uid === chatKey
						);
						if (chat) {
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
									currentUserId &&
									chat.last_message.from_user === currentUserId;
								chat.last_message = {
									...chat.last_message,
									new: false,
									status: isLastMsgSentByMe
										? MessageStatus.READ
										: MessageStatus.RECEIVED
								};
							}
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
			batchTimerRef.current = setTimeout(
				flushBatch,
				AUTO_READ_CONFIG.BATCH_DELAY
			);
		},
		[currentUserId, queryArgs, chatKey, dispatch, flushBatch]
	);

	useEffect(() => {
		const container = containerRef.current;

		if (!container || !queryArgs) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				const visibleUids: string[] = [];

				entries.forEach(entry => {
					if (!entry.isIntersecting) {
						return;
					}

					const el = entry.target as HTMLElement;
					const uid = el.getAttribute('data-message-id');
					const isFromCurrentUser = el.getAttribute(
						'data-is-from-current-user'
					);
					const isNew = el.getAttribute('data-is-new');

					if (
						uid &&
						isFromCurrentUser !== 'true' &&
						isNew === 'true' &&
						!markedRef.current.has(uid)
					) {
						visibleUids.push(uid);
					}
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

		// Навешиваем observer на сообщения
		const messages = container.querySelectorAll('[data-message-id]');

		messages.forEach(el => observer.observe(el));

		return () => observer.disconnect();
	}, [containerRef, queryArgs, markAsRead]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}
		const observer = new IntersectionObserver(() => {}, {
			root: container,
			rootMargin: AUTO_READ_CONFIG.ROOT_MARGIN,
			threshold: AUTO_READ_CONFIG.THRESHOLD
		});

		container.querySelectorAll('[data-message-id]').forEach(el => {
			const uid = el.getAttribute('data-message-id');
			if (uid && !uid.startsWith('temp_') && !markedRef.current.has(uid)) {
				observer.observe(el);
			}
		});

		return () => observer.disconnect();
	}, [containerRef, queryArgs?.user_uid]);

	useEffect(() => {
		return () => {
			markedRef.current.clear();
			batchQueueRef.current = [];
			if (batchTimerRef.current) {
				clearTimeout(batchTimerRef.current);
			}
		};
	}, [queryArgs?.user_uid]);
};
