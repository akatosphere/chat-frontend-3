'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChatHeader, MessagesList } from '@/entities/Chat';

import { useChatHeaderData } from '@/entities/Chat/model/lib/hooks/useChatHeaderData/useChatHeaderData';
import {
	selectChatByUid,
	useGetMessagesQuery
} from '@/entities/Chat/api/chatApi';
import { UserCardSkeleton } from '@/shared/ui/Skeleton';
import { UserCardType } from '@/shared/ui/UserCard';
import { NotMessage } from '@/shared/ui/NotMessage/NotMessage';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import { classNames } from '@/shared/lib/classNames/classNames';
import { RootState } from '@/app/providers/StoreProvider';
import { Chat, ChatMessage } from '../../model/types/chat.types/chat.types';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import cls from './ChatView.module.scss';
import { MessageFormComponent } from '../ChatBottom';

interface ChatViewProps {
	chatUid: string;
	onBack?: () => void;
	userDataFromSearch?: {
		userName: string;
		avatar?: string;
		isOnline?: boolean;
	};
}

const MESSAGES_PAGE_SIZE = 50;
const MESSAGES_ORDERING = '-created_at';

export const ChatView = ({
	chatUid,
	userDataFromSearch,
	onBack
}: ChatViewProps) => {
	const isMobile = useMediaQuery();
	const [isActionBarVisible, setIsActionBarVisible] = useState(true);

	// ─────────────────────────────────────────────────────────────
	// DATA: Чат из кеша списка (основной источник)
	// ─────────────────────────────────────────────────────────────
	const chatDataFromCache = useSelector((state: RootState) =>
		selectChatByUid(state, chatUid)
	);

	// ─────────────────────────────────────────────────────────────
	// DATA: Сообщения (запрашиваем всегда, бэкенд сам обработает создание чата)
	// ─────────────────────────────────────────────────────────────
	const {
		data: messagesResponse,
		isLoading: isMessagesLoading,
		isError: isMessagesError,
		error: messagesError
	} = useGetMessagesQuery(
		{
			user_uid: chatUid,
			page_size: MESSAGES_PAGE_SIZE,
			ordering: MESSAGES_ORDERING
		},
		{
			skip: !chatUid
		}
	);

	const isForbidden = (messagesError as FetchBaseQueryError)?.status === 403;
	const hasRealError = isMessagesError && !isForbidden;

	const messages = useMemo<ChatMessage[]>(() => {
		if (isForbidden) {
			return [];
		}
		return messagesResponse?.results ?? [];
	}, [messagesResponse, isForbidden]);

	// ─────────────────────────────────────────────────────────────
	// DATA: Объединяем источники (прямой запрос чата отключён)
	// ─────────────────────────────────────────────────────────────
	const chatData = useMemo<Chat | null>(() => {
		return chatDataFromCache ?? null;
	}, [chatDataFromCache]);

	// ─────────────────────────────────────────────────────────────
	// HEADER DATA
	// ─────────────────────────────────────────────────────────────
	const { headerData, hasMessages } = useChatHeaderData(chatData);

	const getPreviewData = (uid: string | undefined) => {
		if (!uid) {
			return {};
		}

		const localStorageKey = `chat_preview_${uid}`;
		const sessionStorageKey = `chat_preview_data_${uid}`;

		try {
			const sessionRaw = sessionStorage.getItem(sessionStorageKey);
			if (sessionRaw) {
				return JSON.parse(sessionRaw) as {
					userName?: string;
					avatar?: string;
					isOnline?: boolean;
				};
			}

			const localRaw = localStorage.getItem(localStorageKey);
			if (localRaw) {
				const parsed = JSON.parse(localRaw) as {
					userName?: string;
					avatar?: string;
					isOnline?: boolean;
				};

				try {
					sessionStorage.setItem(sessionStorageKey, localRaw);
					localStorage.removeItem(localStorageKey);
				} catch (saveError) {
					console.error('Preview save error:', saveError);
				}
				return parsed;
			}
		} catch (e) {
			console.error('Preview parse error:', e);
		}
		return {};
	};

	const safeHeaderData = useMemo(() => {
		const preview = chatUid ? getPreviewData(chatUid) : {};

		const baseData = {
			userName:
				userDataFromSearch?.userName ??
				preview?.userName ??
				headerData?.userName ??
				'Неизвестный пользователь',

			userStatus: headerData?.userStatus ?? 'был(а) давно',

			userAvatar:
				userDataFromSearch?.avatar ?? preview?.avatar ?? headerData?.userAvatar,

			isOnline:
				userDataFromSearch?.isOnline ??
				preview?.isOnline ??
				headerData?.isOnline ??
				false,

			isInContacts: headerData?.isInContacts ?? false
		};

		const contactData = {
			contactPhone: chatData?.chat?.username?.startsWith('+')
				? chatData.chat.username
				: undefined,
			contactFirstName: chatData?.chat?.first_name,
			contactLastName: chatData?.chat?.last_name
		};

		return { ...baseData, ...contactData };
	}, [headerData, chatData, userDataFromSearch, chatUid]);

	// ─────────────────────────────────────────────────────────────
	// HANDLERS
	// ─────────────────────────────────────────────────────────────
	const handleBack = useCallback(() => {
		if (onBack) {
			onBack();
		} else {
			window.history.back();
		}
	}, [onBack]);

	const handleCall = useCallback(() => {
		console.log('📞 Call initiated for chat:', chatUid);
	}, [chatUid]);

	const handleAddToContacts = useCallback(() => {
		console.log('👤 Add to contacts:', chatUid);
	}, [chatUid]);

	const handleBlock = useCallback(() => {
		console.log('🚫 Block user:', chatUid);
	}, [chatUid]);

	// RENDER: Loading State (только для сообщений)
	// ─────────────────────────────────────────────────────────────

	if (isMessagesLoading && !chatData && messages.length === 0 && !isForbidden) {
		return (
			<section className={cls.chatView}>
				<UserCardSkeleton count={1} type={UserCardType.CONTACT} />
			</section>
		);
	}

	// ─────────────────────────────────────────────────────────────
	// RENDER: Error State (только реальные ошибки, не 403)
	// ─────────────────────────────────────────────────────────────

	if (hasRealError && !chatData) {
		return (
			<section className={cls.chatView}>
				<div className={cls.notMessageWrapper}>
					<NotMessage />
				</div>
			</section>
		);
	}

	// ─────────────────────────────────────────────────────────────
	// RENDER: Empty State (чат не найден в кеше ИЛИ 403)
	// ─────────────────────────────────────────────────────────────

	if (!chatData || isForbidden) {
		return (
			<section className={cls.chatView}>
				<ChatHeader
					{...safeHeaderData}
					onCall={handleCall}
					onAddToContacts={handleAddToContacts}
					onBlock={handleBlock}
					onBack={isMobile ? handleBack : undefined}
					onActionBarVisibilityChange={setIsActionBarVisible}
				/>

				<div className={cls.notMessageWrapper}>
					<NotMessage />
				</div>

				<MessageFormComponent />
			</section>
		);
	}

	// ─────────────────────────────────────────────────────────────
	// RENDER: Main Content (чат найден, всё работает)
	// ─────────────────────────────────────────────────────────────
	const messagesClass = classNames(cls.messagesContent, {
		[cls.messagesContent_noRadius]: isMobile && isActionBarVisible
	});

	return (
		<section className={cls.chatView}>
			<ChatHeader
				{...safeHeaderData}
				onCall={handleCall}
				onAddToContacts={handleAddToContacts}
				onBlock={handleBlock}
				onBack={isMobile ? handleBack : undefined}
				onActionBarVisibilityChange={setIsActionBarVisible}
			/>

			{hasMessages ? (
				<>
					<MessagesList userUid={chatUid} className={messagesClass} />
					<MessageFormComponent />
				</>
			) : (
				<>
					<div className={cls.notMessageWrapper}>
						<NotMessage />
					</div>
					<MessageFormComponent />
				</>
			)}
		</section>
	);
};

ChatView.displayName = 'ChatView';
