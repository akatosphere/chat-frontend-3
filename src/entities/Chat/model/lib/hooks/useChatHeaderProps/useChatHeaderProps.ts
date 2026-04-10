import { useMemo } from 'react';
import {
	ChatHeaderUserData,
	ChatHeaderProps
} from '../../../types/chat.types/chat.types';

interface UseChatHeaderPropsOptions {
	userData: ChatHeaderUserData;

	isMobile: boolean;

	handlers: {
		onCall: () => void;
		onAddToContacts?: () => void;
		onBlock?: () => void;
		onBack?: () => void;
		handleBack: () => void;
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

			onNavigateToMessage
		}),
		[userData, isMobile, handlers, setters, search, onNavigateToMessage]
	);
};
