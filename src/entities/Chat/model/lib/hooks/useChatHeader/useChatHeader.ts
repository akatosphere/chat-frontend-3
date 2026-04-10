import { useState, useRef, useCallback, useEffect } from 'react';
import { useClickOutside } from '@/shared/lib/hooks/useClickOutSide/useClickOutside';
import { ChatHeaderProps } from '../../../types/chat.types/chat.types';

export const useChatHeader = ({
	isInContacts = false,
	isSearchVisible = false,
	onSearchToggle,
	onSearchQueryChange,
	activeResultId,
	onNavigateToMessage,
	searchResultsCount = 0,
	navigateToNext,
	navigateToPrev,
	onAddToContacts,
	onBlock,
	onActionBarVisibilityChange
}: ChatHeaderProps) => {
	const [manuallyClosedActionBar, setManuallyClosedActionBar] = useState(false);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);

	const isActionBarVisible = !isInContacts && !manuallyClosedActionBar;

	useEffect(() => {
		if (!activeResultId || !isSearchVisible || !onNavigateToMessage) {
			return;
		}

		requestAnimationFrame(() => {
			onNavigateToMessage(activeResultId);
		});
	}, [activeResultId, isSearchVisible, onNavigateToMessage]);

	useEffect(() => {
		if (!isSearchVisible || !searchResultsCount) {
			return;
		}

		const handler = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
				e.preventDefault();

				if (e.shiftKey) {
					navigateToPrev?.();
				} else {
					navigateToNext?.();
				}
			}
		};

		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [isSearchVisible, searchResultsCount, navigateToNext, navigateToPrev]);

	useClickOutside(searchRef, () => {
		if (isSearchVisible) {
			onSearchQueryChange?.('');
			onSearchToggle?.();
		}
	});

	useEffect(() => {
		if (isSearchVisible) {
			searchRef.current?.querySelector('input')?.focus();
		}
	}, [isSearchVisible]);

	useEffect(() => {
		if (isSuccessModalOpen) {
			const timer = setTimeout(() => setIsSuccessModalOpen(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [isSuccessModalOpen]);

	useEffect(() => {
		onActionBarVisibilityChange?.(isActionBarVisible);
	}, [isActionBarVisible, onActionBarVisibilityChange]);

	const handleAddToContacts = useCallback(() => {
		onAddToContacts?.();
		setManuallyClosedActionBar(true);
		setIsSuccessModalOpen(true);
	}, [onAddToContacts]);

	const handleBlock = useCallback(() => {
		onBlock?.();
		setManuallyClosedActionBar(true);
	}, [onBlock]);

	const handleActionBarClose = useCallback(
		() => setManuallyClosedActionBar(true),
		[]
	);
	const handleSearchToggle = useCallback(
		() => onSearchToggle?.(),
		[onSearchToggle]
	);

	const handleSearchClear = useCallback(
		(value: string) => {
			if (!value) {
				onSearchToggle?.();
			}
		},
		[onSearchToggle]
	);

	return {
		searchRef,
		isActionBarVisible,
		isSuccessModalOpen,
		handleAddToContacts,
		handleBlock,
		handleActionBarClose,
		handleSearchToggle,
		handleSearchClear
	};
};
