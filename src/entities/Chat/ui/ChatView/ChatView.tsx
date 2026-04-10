'use client';

import { useCallback, useRef, useState } from 'react';
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
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { selectCurrentUserId } from '@/entities/Profile/model/selectors/selectCurrentUserId';

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

	const isMobile = useMediaQuery();
	const [isActionBarVisible, setIsActionBarVisible] = useState(true);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const currentUserId = useAppSelector(selectCurrentUserId);

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
	const handleAddToContacts = useCallback(() => {}, []);
	const handleBlock = useCallback(() => {}, []);

	// ─────────────────────────────────────────────────────────────

	const headerProps = useChatHeaderProps({
		userData: headerData,
		isMobile,
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
					/>
				</>
			)}
		</section>
	);
};

ChatView.displayName = 'ChatView';
