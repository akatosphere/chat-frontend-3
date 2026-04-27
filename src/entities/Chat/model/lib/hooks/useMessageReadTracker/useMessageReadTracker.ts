import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';
import {
	GetMessagesRequest,
	MessageStatus,
	ChatMessage
} from '../../../types/chat.types/chat.types';
import { CHATS_QUERY_DEFAULTS } from '@/shared/model';
import { logger } from '@/shared/lib/logger/logger';
import { chatApi, markMessagesAsRead } from '@/entities/Chat/api';
import { useMarkChatLastSeenMutation } from '@/entities/Chat/api/chatApi/chatApi';

const AUTO_READ_CONFIG = {
	THRESHOLD: 0.1,
	ROOT_MARGIN: '50px',
	BATCH_DELAY: 300
};

interface UseMessageReadTrackerOptions {
	containerRef: React.RefObject<HTMLDivElement | null>;
	queryArgs: GetMessagesRequest | null;
	chatKey: string;
	chatId?: number;
}

export const useMessageReadTracker = ({
	containerRef,
	queryArgs,
	chatKey,
	chatId
}: UseMessageReadTrackerOptions) => {
	const dispatch = useAppDispatch();
	const currentUserId = useAppSelector(selectCurrentUserId);
	const [markChatLastSeen] = useMarkChatLastSeenMutation();

	const markedRef = useRef<Set<string>>(new Set());
	const batchQueueRef = useRef<{ uid: string; chatKey: string }[]>([]);
	const batchTimerRef = useRef<NodeJS.Timeout | null>(null);
	const lastSeenSentRef = useRef<Set<string>>(new Set());

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

		dispatch(chatApi.util.invalidateTags([{ type: 'Chats', id: 'LIST' }]));

		const errors = results.filter(
			(r): r is PromiseRejectedResult => r.status === 'rejected'
		);
		if (errors.length > 0) {
			logger.warn(
				`Ошибки при отправке read receipt: ${errors.length} из ${batch.length}`,
				errors
			);
		}
	}, [currentUserId, dispatch]);

	const markChatAsRead = useCallback(
		async (lastMessageUid: string) => {
			if (!chatId || chatId <= 0) {
				logger.warn('[markChatAsRead] Invalid chatId:', chatId);
				return;
			}

			if (lastSeenSentRef.current.has(lastMessageUid)) {
				return;
			}

			lastSeenSentRef.current.add(lastMessageUid);

			try {
				await markChatLastSeen({
					id: chatId,
					last_seen_message: lastMessageUid
				}).unwrap();

				dispatch(
					chatApi.util.invalidateTags([
						{ type: 'Chats', id: chatId },
						{ type: 'Chats', id: 'LIST' }
					])
				);

				dispatch(
					chatApi.util.prefetch('getChats', CHATS_QUERY_DEFAULTS, {
						force: true
					})
				);
			} catch (error) {
				logger.error('[markChatAsRead] Failed:', {
					chatId,
					lastMessageUid,
					error
				});
				lastSeenSentRef.current.delete(lastMessageUid);
			}
		},
		[chatId, markChatLastSeen, dispatch]
	);

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

			const incomingUnreadInBatch = toMark.length;

			dispatch(
				chatApi.util.updateQueryData(
					'getChats',
					CHATS_QUERY_DEFAULTS,
					draft => {
						if (!draft?.results) {
							return;
						}
						const chat = draft.results.find(
							c => c.chat_key === chatKey || c.chat.uid === chatKey
						);

						if (!chat) {
							return;
						}

						if (incomingUnreadInBatch > 0 && chat.new_message_count > 0) {
							chat.new_message_count = Math.max(
								0,
								chat.new_message_count - incomingUnreadInBatch
							);

							if (chat.new_message_count === 0) {
								chat.first_new_message = null;
							}
						}

						if (
							chat.last_message?.uid &&
							toMark.includes(chat.last_message.uid)
						) {
							chat.last_message = {
								...chat.last_message,
								new: false,
								status: MessageStatus.READ
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
				let lastMessageUid: string | null = null;

				entries.forEach(entry => {
					if (!entry.isIntersecting) {
						return;
					}

					const el = entry.target as HTMLElement;
					const uid = el.getAttribute('data-message-id'); // 🔥 Тип: string | null
					const isFromCurrentUser = el.getAttribute(
						'data-is-from-current-user'
					);
					const isNew = el.getAttribute('data-is-new');
					const isLastMessage =
						el.getAttribute('data-is-last-message') === 'true';

					if (isLastMessage && uid) {
						const isTemp = uid && (uid as string).startsWith('temp_');
						const isOwn = isFromCurrentUser === 'true';
						if (!isTemp && !isOwn) {
							lastMessageUid = uid;
						} else {
							lastMessageUid = null;
						}
					}

					if (
						uid &&
						!(uid as string).startsWith('temp_') &&
						isFromCurrentUser !== 'true' &&
						isNew === 'true' &&
						!markedRef.current.has(uid)
					) {
						visibleUids.push(uid);
					}
				});

				if (
					lastMessageUid &&
					chatId &&
					chatId > 0 &&
					!(lastMessageUid as string).startsWith('temp_')
				) {
					markChatAsRead(lastMessageUid);
				}

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

		const messages = container.querySelectorAll('[data-message-id]');
		messages.forEach(el => observer.observe(el));

		return () => observer.disconnect();
	}, [containerRef, queryArgs, markAsRead, markChatAsRead, chatId]);

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
			if (
				uid &&
				!(uid as string).startsWith('temp_') &&
				!markedRef.current.has(uid)
			) {
				observer.observe(el);
			}
		});

		return () => observer.disconnect();
	}, [containerRef, queryArgs?.user_uid]);

	useEffect(() => {
		return () => {
			markedRef.current.clear();
			batchQueueRef.current = [];
			lastSeenSentRef.current.clear();
			if (batchTimerRef.current) {
				clearTimeout(batchTimerRef.current);
			}
		};
	}, [queryArgs?.user_uid]);
};
