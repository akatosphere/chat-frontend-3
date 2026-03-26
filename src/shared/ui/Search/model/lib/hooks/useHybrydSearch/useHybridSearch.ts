'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';

export interface SearchSectionData<T> {
	title: string;
	items: T[];
	type: 'local' | 'global';
	isLoading?: boolean;
	showHeader?: boolean;
}

export function useHybridSearch<
	T extends { uid?: string | number; id?: string | number }
>(
	localData: T[],
	localFilterFn: (items: T[], searchTerm: string) => T[],
	globalSearchFn?: (searchTerm: string, signal?: AbortSignal) => Promise<T[]>,
	debounceDelay: number = 300,
	globalPrefix: string = '@',
	globalMinLength: number = 3
) {
	const [searchTerm, setSearchTerm] = useState('');

	const [globalResults, setGlobalResults] = useState<T[]>([]);
	const [isGlobal, setIsGlobal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	// Локальные результаты — синхронно через useMemo
	const localResults = useMemo(() => {
		if (!searchTerm.trim()) {
			return localData;
		}
		return localFilterFn(localData, searchTerm);
	}, [localData, searchTerm, localFilterFn]);

	// Debounced глобальный поиск
	const debouncedGlobalSearch = useDebounce(async (term: string) => {
		if (!globalSearchFn) {
			return;
		}

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const controller = new AbortController();
		abortControllerRef.current = controller;

		if (term.length === 0 || term.length < globalMinLength) {
			setGlobalResults([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const data = await globalSearchFn(term, controller.signal);
			setGlobalResults(data);
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				return;
			}
			setError(err instanceof Error ? err : new Error('Search failed'));
		} finally {
			if (!controller.signal.aborted) {
				setIsLoading(false);
			}
		}
	}, debounceDelay);

	const isGlobalSearch = useCallback(
		(term: string): boolean => term.trim().startsWith(globalPrefix),
		[globalPrefix]
	);

	const handleSearchChange = useCallback(
		(value: string) => {
			setSearchTerm(value);
			const trimmed = value.trim();

			if (trimmed.length === 0) {
				setGlobalResults([]);
				setIsGlobal(false);
				setError(null);
				return;
			}

			const global = isGlobalSearch(trimmed);
			setIsGlobal(global);

			if (global && globalSearchFn) {
				const searchQuery = trimmed.slice(globalPrefix.length).trim();

				if (!searchQuery || searchQuery.length < globalMinLength) {
					setGlobalResults([]);
					setIsLoading(false);
					return;
				}

				debouncedGlobalSearch(searchQuery);
			} else {
				setGlobalResults([]);
			}
		},
		[
			isGlobalSearch,
			globalPrefix,
			globalMinLength,
			debouncedGlobalSearch,
			globalSearchFn
		]
	);

	const handleClear = useCallback(() => {
		setSearchTerm('');
		setGlobalResults([]);
		setIsGlobal(false);
		setError(null);

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
	}, []);

	//  Формируем секции для отображения
	const sections = useMemo(() => {
		const result: SearchSectionData<T>[] = [];
		const hasSearchTerm = searchTerm.trim().length > 0;

		//  Секция 1: Локальные контакты
		// showHeader: false — заголовок уже рендерится в ContactsHeader
		if (!isGlobal && localResults.length > 0 && hasSearchTerm) {
			result.push({
				title: 'Контакты пользователей А-чата',
				items: localResults,
				type: 'local',
				showHeader: false
			});
		}

		// Секция 2: Глобальный поиск
		if (globalResults.length > 0) {
			result.push({
				title: isGlobal ? 'Глобальный поиск' : 'Пользователи А-Чата',
				items: globalResults,
				type: 'global',
				isLoading: isLoading && globalResults.length === 0,
				showHeader: true
			});
		}

		return result;
	}, [searchTerm, isGlobal, localResults, globalResults, isLoading]);

	const combinedResults = useMemo(() => {
		if (isGlobal) {
			return globalResults;
		}
		return localResults;
	}, [isGlobal, globalResults, localResults]);

	const totalResults = useMemo(() => {
		return sections.reduce((acc, section) => acc + section.items.length, 0);
	}, [sections]);

	return useMemo(
		() => ({
			sections,
			totalResults,
			searchTerm,
			results: combinedResults,
			localResults,
			globalResults,
			isGlobal,
			isLoading,
			error,
			handleSearchChange,
			handleClear,
			setGlobalResults
		}),
		[
			sections,
			totalResults,
			searchTerm,
			combinedResults,
			localResults,
			globalResults,
			isGlobal,
			isLoading,
			error,
			handleSearchChange,
			handleClear
		]
	);
}

export type UseHybridSearchReturn<
	T extends { uid?: string | number; id?: string | number }
> = ReturnType<typeof useHybridSearch<T>>;

export function filterContacts<
	T extends {
		uid?: string;
		id?: string;
		first_name?: string;
		last_name?: string;
		nickname?: string;
		username?: string;
		phone?: string;
	}
>(items: T[], searchTerm: string): T[] {
	const term = searchTerm.toLowerCase().trim();

	if (!term) {
		return items;
	}

	const normalizedTerm = term.replace(/[\s\-\(\)]/g, '');

	return items.filter(item => {
		const firstName = item.first_name?.toLowerCase() || '';
		const lastName = item.last_name?.toLowerCase() || '';
		const nickname = item.nickname?.toLowerCase() || '';
		const username = item.username?.toLowerCase() || '';
		const phone = item.phone?.toLowerCase() || '';

		const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
		const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

		return (
			firstName.includes(term) ||
			lastName.includes(term) ||
			nickname.includes(term) ||
			username.includes(term) ||
			fullName.includes(term) ||
			phone.includes(term) ||
			normalizedPhone.includes(normalizedTerm)
		);
	});
}
