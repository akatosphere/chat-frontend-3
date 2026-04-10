import { useMemo, useCallback, useState, useEffect } from 'react';
import {
	Message,
	MessageType,
	TextMessage,
	SystemMessageData,
	MessageOccurrence,
	UseMessageSearchOptions,
	UseMessageSearchReturn
} from '../../../types/chat.types/chat.types';

export function useMessageSearch({
	messages,
	searchQuery,
	caseSensitive = false,
	searchInSender = true,
	searchInSystemText = false
}: UseMessageSearchOptions): UseMessageSearchReturn {
	const normalize = useCallback(
		(text: string) => (caseSensitive ? text : text.toLowerCase()),
		[caseSensitive]
	);

	const messageMatches = useCallback(
		(message: Message, query: string): boolean => {
			if (!query.trim()) {
				return true;
			}
			const normalizedQuery = normalize(query.trim());

			if (message.type === MessageType.TEXT) {
				const textMsg = message as TextMessage;
				const contentMatch = normalize(textMsg.content).includes(
					normalizedQuery
				);
				if (searchInSender && textMsg.senderName) {
					return (
						contentMatch ||
						normalize(textMsg.senderName).includes(normalizedQuery)
					);
				}
				return contentMatch;
			}

			if (message.type === MessageType.SYSTEM && searchInSystemText) {
				const sysMsg = message as SystemMessageData;
				return normalize(JSON.stringify(sysMsg.eventData)).includes(
					normalizedQuery
				);
			}

			return false;
		},
		[normalize, searchInSender, searchInSystemText]
	);

	const filteredMessages = useMemo(() => {
		if (!searchQuery.trim()) {
			return messages;
		}
		return messages.filter(msg => messageMatches(msg, searchQuery));
	}, [messages, searchQuery, messageMatches]);

	const findAllOccurrences = useCallback(
		(text: string, query: string): number[] => {
			if (!query.trim()) {
				return [];
			}
			const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(escaped, 'gi');
			const indices: number[] = [];
			let match;
			while ((match = regex.exec(text)) !== null) {
				indices.push(match.index);
			}
			return indices;
		},
		[]
	);

	const occurrences = useMemo((): MessageOccurrence[] => {
		if (!searchQuery.trim()) {
			return [];
		}

		const all: MessageOccurrence[] = [];
		let globalIndex = 0;

		filteredMessages.forEach((message, msgIdx) => {
			if (message.type !== MessageType.TEXT) {
				return;
			}

			const textMsg = message as TextMessage;

			const indices = findAllOccurrences(textMsg.content, searchQuery);

			indices.forEach((position, occurrenceIndex) => {
				const messageId = String(message.id);

				all.push({
					messageId,
					occurrenceIndex,
					globalIndex: globalIndex++,
					content: textMsg.content || '',
					position
				});
			});
		});

		return all;
	}, [filteredMessages, searchQuery, findAllOccurrences]);

	const [activeOccurrenceIndex, setActiveOccurrenceIndex] = useState(0);

	const activeOccurrence = useMemo(() => {
		if (occurrences.length === 0) {
			return null;
		}
		const safe = Math.max(
			0,
			Math.min(activeOccurrenceIndex, occurrences.length - 1)
		);
		return occurrences[safe];
	}, [occurrences, activeOccurrenceIndex]);

	const goToNextOccurrence = useCallback(() => {
		if (occurrences.length === 0) {
			return;
		}
		setActiveOccurrenceIndex(prev => (prev + 1) % occurrences.length);
	}, [occurrences.length]);

	const goToPrevOccurrence = useCallback(() => {
		if (occurrences.length === 0) {
			return;
		}
		setActiveOccurrenceIndex(
			prev => (prev - 1 + occurrences.length) % occurrences.length
		);
	}, [occurrences.length]);

	const getActiveOccurrencesForMessage = useCallback(
		(messageId: string): number[] => {
			const result =
				!activeOccurrence || activeOccurrence.messageId !== messageId
					? []
					: [activeOccurrence.occurrenceIndex];

			return result;
		},
		[activeOccurrence]
	);

	const matchingIndices = useMemo(() => {
		if (!searchQuery.trim()) {
			return [];
		}
		return messages
			.map((msg, idx) => (messageMatches(msg, searchQuery) ? idx : -1))
			.filter((idx): idx is number => idx !== -1);
	}, [messages, searchQuery, messageMatches]);

	useEffect(() => {
		setActiveOccurrenceIndex(0);
	}, [searchQuery]);

	return useMemo(
		() => ({
			filteredMessages,
			matchingIndices,
			occurrences,
			activeOccurrenceIndex,
			activeOccurrence,
			totalOccurrences: occurrences.length,
			goToNextOccurrence,
			goToPrevOccurrence,
			getActiveOccurrencesForMessage,
			activeResultIndex: activeOccurrenceIndex,
			activeResultId: activeOccurrence?.messageId,
			searchResultsCount: occurrences.length,
			navigateToNext: goToNextOccurrence,
			navigateToPrev: goToPrevOccurrence,
			setActiveResultIndex: setActiveOccurrenceIndex
		}),
		[
			filteredMessages,
			matchingIndices,
			occurrences,
			activeOccurrenceIndex,
			activeOccurrence,
			goToNextOccurrence,
			goToPrevOccurrence,
			getActiveOccurrencesForMessage
		]
	);
}
