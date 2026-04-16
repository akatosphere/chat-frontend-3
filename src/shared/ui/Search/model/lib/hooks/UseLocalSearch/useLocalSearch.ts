import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useLocalSearch<T>(
	data: T[],
	filterFn: (items: T[], searchTerm: string) => T[],
	debounceDelay: number = 300
) {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredData, setFilteredData] = useState<T[]>([]);

	const memoizedFilteredData = useMemo(() => filteredData, [filteredData]);

	const debouncedFilter = useDebounce((term: string) => {
		if (term.length === 0) {
			setFilteredData(data);
			return;
		}
		const results = filterFn(data, term);
		setFilteredData(results);
	}, debounceDelay);

	useEffect(() => {
		debouncedFilter(searchTerm.trim());
	}, [searchTerm, debouncedFilter, data]);

	const handleSearchChange = useCallback((value: string) => {
		setSearchTerm(value);
	}, []);

	const handleClear = useCallback(() => {
		setSearchTerm('');
		setFilteredData([]);
	}, []);

	return useMemo(
		() => ({
			searchTerm,
			filteredData: memoizedFilteredData,
			handleSearchChange,
			handleClear
		}),
		[searchTerm, memoizedFilteredData, handleSearchChange, handleClear]
	);
}
