export function filterByField<T>(
	items: T[],
	searchTerm: string,
	field: keyof T,
	options?: { caseSensitive?: boolean; normalize?: (val: string) => string }
): T[] {
	const { caseSensitive = false, normalize = (v: string) => v.toLowerCase() } =
		options || {};
	const term = caseSensitive ? searchTerm.trim() : normalize(searchTerm.trim());

	if (!term) {
		return [];
	}

	return items.filter(item => {
		const raw = item[field] as string | undefined;
		if (!raw) {
			return false;
		}
		const value = caseSensitive ? raw : normalize(raw);
		return value.includes(term);
	});
}

// Специализированный фильтр для сообщений (использует несколько полей)
export function filterMessages<
	T extends { content?: string; senderName?: string; type: string }
>(items: T[], searchTerm: string): T[] {
	const term = searchTerm.toLowerCase().trim();
	if (!term) {
		return [];
	}

	return items.filter(msg => {
		if (msg.type !== 'text') {
			return false;
		}
		const content = msg.content?.toLowerCase() || '';
		const sender = msg.senderName?.toLowerCase() || '';
		return content.includes(term) || sender.includes(term);
	});
}
