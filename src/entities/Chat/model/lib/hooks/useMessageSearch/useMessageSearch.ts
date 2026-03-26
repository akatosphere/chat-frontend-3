import { useMemo, useCallback, useState, useEffect } from 'react';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import {
	Message,
	MessageType,
	TextMessage,
	SystemMessageData
} from '../../../types/chat.types/chat.types';

export interface UseMessageSearchReturn {
	filteredMessages: Message[];
	matchingIndices: number[];
	activeResultIndex: number;
	activeResultId: string | undefined;
	searchResultsCount: number;
	navigateToNext: () => void;
	navigateToPrev: () => void;
	setActiveResultIndex: (index: number) => void;
}

export interface UseMessageSearchOptions {
	messages: Message[];
	searchQuery: string;
	caseSensitive?: boolean;
	searchInSender?: boolean;
	searchInSystemText?: boolean;
	debounceDelay?: number;
}

export function useMessageSearch({
	messages,
	searchQuery,
	caseSensitive = false,
	searchInSender = true,
	searchInSystemText = false,
	debounceDelay = 300
}: UseMessageSearchOptions): UseMessageSearchReturn {
	const [activeResultIndex, setActiveResultIndex] = useState(0);
	const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

	//  Дебаунс-функция для обновления debouncedQuery
	const debouncedSetQuery = useDebounce(
		(value: string) => setDebouncedQuery(value),
		debounceDelay
	);

	//  Синхронизация searchQuery → debouncedQuery
	useEffect(() => {
		debouncedSetQuery(searchQuery);
	}, [searchQuery, debouncedSetQuery]);

	//  Нормализация текста
	const normalize = useCallback(
		(text: string) => (caseSensitive ? text : text.toLowerCase()),
		[caseSensitive]
	);

	//  Проверка соответствия сообщения запросу
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
					const senderMatch = normalize(textMsg.senderName).includes(
						normalizedQuery
					);
					return contentMatch || senderMatch;
				}
				return contentMatch;
			}

			if (message.type === MessageType.SYSTEM && searchInSystemText) {
				const sysMsg = message as SystemMessageData;
				const systemText = JSON.stringify(sysMsg.eventData).toLowerCase();
				return normalize(systemText).includes(normalizedQuery);
			}

			return false;
		},
		[normalize, searchInSender, searchInSystemText]
	);

	//  Фильтрация сообщений
	const filteredMessages = useMemo(() => {
		if (!debouncedQuery.trim()) {
			return messages;
		}
		return messages.filter(msg => messageMatches(msg, debouncedQuery));
	}, [messages, debouncedQuery, messageMatches]);

	//  Индексы совпадений в исходном массиве
	const matchingIndices = useMemo(() => {
		if (!debouncedQuery.trim()) {
			return [];
		}
		return messages
			.map((msg, idx) => (messageMatches(msg, debouncedQuery) ? idx : -1))
			.filter((idx): idx is number => idx !== -1);
	}, [messages, debouncedQuery, messageMatches]);

	//  Навигация по результатам
	const navigateToNext = useCallback(() => {
		if (matchingIndices.length === 0) {
			return;
		}
		setActiveResultIndex(prev =>
			prev >= matchingIndices.length - 1 ? 0 : prev + 1
		);
	}, [matchingIndices]);

	const navigateToPrev = useCallback(() => {
		if (matchingIndices.length === 0) {
			return;
		}
		setActiveResultIndex(prev =>
			prev <= 0 ? matchingIndices.length - 1 : prev - 1
		);
	}, [matchingIndices]);

	//  ID активного результата
	const activeResultId = useMemo(() => {
		const idx = matchingIndices[activeResultIndex];
		return idx !== undefined ? messages[idx]?.id : undefined;
	}, [matchingIndices, activeResultIndex, messages]);

	//  Возвращаем все необходимые значения + сеттер для ручного управления
	return {
		filteredMessages,
		matchingIndices,
		activeResultIndex,
		activeResultId,
		searchResultsCount: matchingIndices.length,
		navigateToNext,
		navigateToPrev,
		setActiveResultIndex
	};
}
