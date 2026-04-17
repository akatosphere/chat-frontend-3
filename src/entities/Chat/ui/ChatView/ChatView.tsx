'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
	ChatHeader,
	MessageFormComponent,
	MessagesList
} from '@/entities/Chat';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import { classNames } from '@/shared/lib/classNames/classNames';
import { UserCardSkeleton } from '@/shared/ui/Skeleton';
import { UserCardType } from '@/shared/ui/UserCard';
import { NotMessage } from '@/shared/ui/NotMessage/NotMessage';
import { useChatViewData } from '../../model/lib/hooks/useChatViewData/useChatViewData';
import { useChatSearch } from '../../model/lib/hooks/useChatSearch/useChatSearch';
import { useChatHeaderProps } from '../../model/lib/hooks/useChatHeaderProps/useChatHeaderProps';
import { useMessageNavigation } from '../../model/lib/hooks/useMessageNavigation/useMessageNavigation';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';
import {
	useAddContactByPhoneMutation,
	useLazySearchGlobalContactsQuery,
	type AddContactByPhoneRequest
} from '@/entities/Contacts';
import { useAddBlackListMutation } from '@/entities/BlackList/api/blackListApi';
import { logger } from '@/shared/lib/logger/logger';
import { BlockUserModal } from '../BlockUserModal/BlockUserModal';
import { CHATS_PAGE_SIZE, CHATS_ORDERING } from '@/shared/model';
import { useRouter } from 'next/navigation';
import { chatApi } from '../../api/chatApi/chatApi';
import { connectChat } from '../../api/ws/chatActions/chatActions';

import cls from './ChatView.module.scss';

interface ChatViewProps {
	chatUid: string;
	onBack?: () => void;
	userDataFromSearch?: {
		userName: string;
		avatar?: string;
		isOnline?: boolean;
	};
}

export const ChatView = ({
	chatUid,
	userDataFromSearch,
	onBack
}: ChatViewProps) => {
	// ─────────────────────────────────────────────────────────────

	const router = useRouter();

	const [isActionBarVisible, setIsActionBarVisible] = useState(true);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const dispatch = useAppDispatch();

	const isMobile = useMediaQuery();

	const currentUserId = useAppSelector(selectCurrentUserId);

	const [addContact] = useAddContactByPhoneMutation();
	const [getContact] = useLazySearchGlobalContactsQuery();
	const [addBlackList] = useAddBlackListMutation();

	// ─────────────────────────────────────────────────────────────

	const {
		messages,
		headerData,
		hasMessages,
		isLoading,
		hasError,
		isForbidden,
		chatData
	} = useChatViewData({ chatUid, userDataFromSearch });

	useEffect(() => {
		if (!chatUid || !chatData?.chat_key) {
			return;
		}

		connectChat(chatData.chat_key).catch(err => {
			logger.warn('⚠️ connectChat failed:', err);
		});
	}, [chatUid, chatData?.chat_key]);

	// ─────────────────────────────────────────────────────────────

	const {
		searchQuery,
		isSearchVisible,
		onSearchQueryChange,
		onSearchToggle,
		activeResultId,
		searchResultsCount,
		activeResultIndex,
		navigateToNext,
		navigateToPrev,
		getActiveOccurrencesForMessage
	} = useChatSearch(messages);

	const { navigateToMessage } = useMessageNavigation({
		scrollContainerRef,
		activeClass: cls.messageBubble_active
	});

	// ─────────────────────────────────────────────────────────────

	const handleScrollContainerReady = useCallback(
		(container: HTMLDivElement | null) => {
			scrollContainerRef.current = container;
		},
		[]
	);

	const handleBack = useCallback(() => {
		if (onBack) {
			onBack();
		} else {
			window.history.back();
		}
	}, [onBack]);

	const handleCall = useCallback(() => {}, []);

	const handleAddToContacts = useCallback(async () => {
		if (!chatData?.chat?.nickname) {
			logger.warn('No nickname to search contact');
			return;
		}

		try {
			const searchResult = await getContact([
				{ phone_or_nickname: chatData.chat.nickname }
			]).unwrap();

			const found = searchResult.results?.[0];

			if (found?.phone) {
				const body: AddContactByPhoneRequest = {
					phone: found.phone,
					first_name: chatData.chat.first_name || '',
					last_name: chatData.chat.last_name || ''
				};

				await addContact(body).unwrap();

				dispatch(
					chatApi.util.updateQueryData('getChatById', chatUid, draft => {
						if (draft) {
							draft.chat.is_in_contacts = true;
						}
					})
				);

				dispatch(
					chatApi.util.updateQueryData(
						'getChats',
						{ pageSize: CHATS_PAGE_SIZE, ordering: CHATS_ORDERING },
						draft => {
							if (draft?.results) {
								const chat = draft.results.find(c => c.chat.uid === chatUid);
								if (chat) {
									chat.chat.is_in_contacts = true;
								}
							}
						}
					)
				);

				setIsActionBarVisible(false);

				setIsSuccessModalOpen(true);
			}
		} catch (error) {
			logger.error('Failed to add contact:', error);
		}
	}, [chatData, chatUid, getContact, addContact, dispatch]);

	const handleBlock = useCallback(() => {
		setIsBlockModalOpen(true);
	}, []);

	const confirmBlock = useCallback(async () => {
		if (!chatData?.chat?.uid) {
			logger.warn('No chat uid to block');
			return;
		}

		try {
			await addBlackList(chatData.chat.uid).unwrap();

			dispatch(
				chatApi.util.updateQueryData(
					'getChats',
					{
						pageSize: CHATS_PAGE_SIZE,
						ordering: CHATS_ORDERING
					},
					draft => {
						if (draft?.results) {
							const chat = draft.results.find(
								c => c.chat.uid === chatData.chat.uid
							);
							if (chat) {
								chat.chat.is_blocked = true;
							}
						}
					}
				)
			);

			dispatch(
				chatApi.util.updateQueryData(
					'getChatById',
					chatData.chat.uid,
					draft => {
						if (draft) {
							draft.chat.is_blocked = true;
						}
					}
				)
			);

			dispatch(chatApi.util.invalidateTags([{ type: 'Messages', id: 'LIST' }]));

			router.push('/chats');

			setIsActionBarVisible(false);
			setIsBlockModalOpen(false);
		} catch (error: unknown) {
			const err = error as { data?: { message?: string } };
			const isAlreadyBlocked =
				err?.data?.message === 'Пользователь уже заблокирован.';

			if (isAlreadyBlocked) {
				dispatch(
					chatApi.util.updateQueryData(
						'getChats',
						{
							pageSize: CHATS_PAGE_SIZE,
							ordering: CHATS_ORDERING
						},
						draft => {
							if (draft?.results) {
								const chat = draft.results.find(
									c => c.chat.uid === chatData.chat.uid
								);
								if (chat) {
									chat.chat.is_blocked = true;
								}
							}
						}
					)
				);

				setIsActionBarVisible(false);
				setIsBlockModalOpen(false);
				return;
			}

			logger.error('Failed to block user:', error);
		}
	}, [chatData, addBlackList, dispatch, router]);

	const cancelBlock = useCallback(() => {
		setIsBlockModalOpen(false);
	}, []);

	// ─────────────────────────────────────────────────────────────

	const headerProps = useChatHeaderProps({
		userData: headerData,
		isMobile,
		isSuccessModalOpen,
		handlers: {
			onCall: handleCall,
			onAddToContacts: handleAddToContacts,
			onBlock: handleBlock,
			onBack: handleBack,
			handleBack
		},
		setters: { onActionBarVisibilityChange: setIsActionBarVisible },
		search: {
			query: searchQuery,
			onQueryChange: onSearchQueryChange,
			isVisible: isSearchVisible,
			onToggle: onSearchToggle,
			resultsCount: searchResultsCount,
			activeIndex: activeResultIndex,
			activeId: activeResultId,
			navigateNext: navigateToNext,
			navigatePrev: navigateToPrev
		},
		onNavigateToMessage: navigateToMessage
	});

	// ─────────────────────────────────────────────────────────────

	if (isLoading && !isForbidden) {
		return (
			<section className={cls.chatView}>
				<UserCardSkeleton count={1} type={UserCardType.CONTACT} />
			</section>
		);
	}
	if (hasError) {
		return (
			<section className={cls.chatView}>
				<div className={cls.notMessageWrapper}>
					<NotMessage />
				</div>
			</section>
		);
	}

	const messagesClass = classNames(cls.messagesContent, {
		[cls.messagesContent_noRadius]: isMobile && isActionBarVisible
	});

	// ─────────────────────────────────────────────────────────────
	return (
		<section className={cls.chatView}>
			<ChatHeader {...headerProps} />

			{hasMessages ? (
				<>
					<MessagesList
						userUid={chatUid}
						chatKey={chatData?.chat_key ?? chatUid}
						currentUserId={currentUserId || undefined}
						className={messagesClass}
						activeResultId={activeResultId}
						searchQuery={searchQuery}
						onScrollContainerReady={handleScrollContainerReady}
						getActiveOccurrencesForMessage={getActiveOccurrencesForMessage}
					/>
					<MessageFormComponent
						chatUid={chatUid}
						chatType={chatData?.chat_type}
						chatKey={chatData?.chat_key}
					/>
				</>
			) : (
				<>
					<div className={cls.notMessageWrapper}>
						<NotMessage />
					</div>
					<MessageFormComponent
						chatUid={chatUid}
						chatType={chatData?.chat_type}
						chatKey={chatData?.chat_key}
						isBlocked={chatData?.chat?.is_blocked}
					/>
				</>
			)}

			{isBlockModalOpen && (
				<BlockUserModal
					isOpen={isBlockModalOpen}
					userFirstName={chatData?.chat?.first_name}
					userLastName={chatData?.chat?.last_name}
					onConfirm={confirmBlock}
					onCancel={cancelBlock}
				/>
			)}
		</section>
	);
};

ChatView.displayName = 'ChatView';
