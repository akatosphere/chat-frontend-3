import { useState, useCallback, useMemo } from 'react';
import { useMessageSearch } from '../useMessageSearch/useMessageSearch';
import {
	Message,
	MessageStatus,
	MessageType
} from '../../../types/chat.types/chat.types';
import { ChatMessage } from '../../../types/chat.types/chat.types';

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
			// 🔹 Извлекаем senderId корректно
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

	const onSearchQueryChange = useCallback((value: string) => {
		setSearchQuery(value);
	}, []);

	const onSearchToggle = useCallback(() => {
		setIsSearchVisible(prev => !prev);

		if (isSearchVisible) {
			setSearchQuery('');
		}
	}, [isSearchVisible]);

	return {
		searchQuery,
		isSearchVisible,
		onSearchQueryChange,
		onSearchToggle,
		...searchHook
	};
};
