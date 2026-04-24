import { useMemo } from 'react';
import {
	ChatHeaderUserData,
	ChatHeaderProps
} from '../../../types/chat.types/chat.types';

interface UseChatHeaderPropsOptions {
	userData: ChatHeaderUserData;

	isMobile: boolean;

	isSuccessModalOpen?: boolean;

	handlers: {
		onCall: () => void | Promise<void>;
		onAddToContacts?: () => void | Promise<void>;
		onBlock?: () => void | Promise<void>;
		onBack?: () => void | Promise<void>;
		handleBack: () => void | Promise<void>;
	};

	setters: {
		onActionBarVisibilityChange: (isVisible: boolean) => void;
	};

	search: {
		query: string;
		onQueryChange: (value: string) => void;
		isVisible: boolean;
		onToggle: () => void;
		resultsCount: number;
		activeIndex: number;
		activeId?: string;
		navigateNext: () => void;
		navigatePrev: () => void;
	};

	onNavigateToMessage?: (messageId: string) => void;
}

export const useChatHeaderProps = ({
	userData,
	isMobile,
	isSuccessModalOpen,
	handlers,
	setters,
	search,
	onNavigateToMessage
}: UseChatHeaderPropsOptions): ChatHeaderProps => {
	return useMemo(
		(): ChatHeaderProps => ({
			userName: userData.userName,
			userStatus: userData.userStatus,
			userAvatar: userData.userAvatar,
			isOnline: userData.isOnline,
			isInContacts: userData.isInContacts,
			contactPhone: userData.contactPhone,
			contactFirstName: userData.contactFirstName,
			contactLastName: userData.contactLastName,

			onCall: handlers.onCall,
			onAddToContacts: handlers.onAddToContacts,
			onBlock: handlers.onBlock,
			onBack: isMobile ? handlers.handleBack : undefined,
			onActionBarVisibilityChange: setters.onActionBarVisibilityChange,

			searchQuery: search.query,
			onSearchQueryChange: search.onQueryChange,
			isSearchVisible: search.isVisible,
			onSearchToggle: search.onToggle,
			searchResultsCount: search.resultsCount,
			activeResultIndex: search.activeIndex,
			activeResultId: search.activeId,
			navigateToNext: search.navigateNext,
			navigateToPrev: search.navigatePrev,
			onNavigateToMessage,
			isSuccessModalOpen
		}),
		[
			userData.userName,
			userData.userStatus,
			userData.userAvatar,
			userData.isOnline,
			userData.isInContacts,
			userData.contactPhone,
			userData.contactFirstName,
			userData.contactLastName,
			handlers.onCall,
			handlers.onAddToContacts,
			handlers.onBlock,
			handlers.handleBack,
			isMobile,
			setters.onActionBarVisibilityChange,
			search.query,
			search.onQueryChange,
			search.isVisible,
			search.onToggle,
			search.resultsCount,
			search.activeIndex,
			search.activeId,
			search.navigateNext,
			search.navigatePrev,
			onNavigateToMessage,
			isSuccessModalOpen
		]
	);
};
