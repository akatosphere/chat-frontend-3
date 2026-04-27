import { useState, useCallback, useMemo } from 'react';
import { useMessageSearch } from '../useMessageSearch/useMessageSearch';
import {
	Message,
	MessageStatus,
	MessageType,
	ChatMessage
} from '../../../types/chat.types/chat.types';

export interface UseChatSearchReturn {
	searchQuery: string;
	isSearchVisible: boolean;
	onSearchQueryChange: (value: string) => void;
	onSearchToggle: () => void;
	activeResultId?: string;
	searchResultsCount: number;
	activeResultIndex: number;
	navigateToNext: () => void;
	navigateToPrev: () => void;
	getActiveOccurrencesForMessage: (messageId: string) => number[] | undefined;
}

export const useChatSearch = (messages: ChatMessage[]): UseChatSearchReturn => {
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearchVisible, setIsSearchVisible] = useState(false);

	const searchMessages = useMemo((): Message[] => {
		return messages.map(msg => {
			const senderId =
				typeof msg.from_user === 'string'
					? msg.from_user
					: msg.from_user?.uid || '';

			return {
				id: String(msg.id),
				uid: msg.uid || '',
				type: MessageType.TEXT,
				createdAt: msg.created_at,
				updatedAt: msg.updated_at,
				content: msg.content || '',
				text: msg.content || '',
				senderId,
				senderName: '',
				status: MessageStatus.RECEIVED,
				has_replied_message: msg.has_replied_message || false,
				has_forwarded_message: msg.has_forwarded_message || false,
				isEdited: false,
				files_summary: msg.files_summary,
				new: msg.new
			};
		});
	}, [messages]);

	const searchHook = useMessageSearch({
		messages: searchMessages,
		searchQuery,
		caseSensitive: false,
		searchInSender: true,
		searchInSystemText: false,
		debounceDelay: 300
	});

	const onSearchQueryChange = useCallback(
		(value: string) => setSearchQuery(value),
		[]
	);

	const onSearchToggle = useCallback(() => {
		setIsSearchVisible(prev => !prev);
		if (isSearchVisible) {
			setSearchQuery('');
		}
	}, [isSearchVisible]);

	const idToUidMap = useMemo(() => {
		const map = new Map<string, string>();
		messages.forEach(msg => {
			map.set(String(msg.id), msg.uid || '');
		});
		return map;
	}, [messages]);

	const activeResultUid = useMemo(() => {
		const activeId = searchHook.activeResultId;
		if (!activeId) {
			return undefined;
		}
		return idToUidMap.get(activeId) || undefined;
	}, [searchHook.activeResultId, idToUidMap]);

	const getActiveOccurrencesForMessage = useCallback(
		(messageUid: string) => {
			if (activeResultUid !== messageUid) {
				return [];
			}
			if (!searchHook.activeResultId) {
				return [];
			}
			return (
				searchHook.getActiveOccurrencesForMessage(searchHook.activeResultId) ||
				[]
			);
		},
		[activeResultUid, searchHook]
	);

	const navigateToNext = useCallback(() => {
		searchHook.navigateToNext?.();
	}, [searchHook]);

	const navigateToPrev = useCallback(() => {
		searchHook.navigateToPrev?.();
	}, [searchHook]);

	return {
		searchQuery,
		isSearchVisible,
		onSearchQueryChange,
		onSearchToggle,

		navigateToNext,
		navigateToPrev,

		activeResultId: activeResultUid,
		searchResultsCount: searchHook.searchResultsCount ?? 0,
		activeResultIndex: searchHook.activeResultIndex ?? 0,

		getActiveOccurrencesForMessage
	};
};
