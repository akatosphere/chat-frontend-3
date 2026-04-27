export function formatMessageTime(date: Date): string {
	return new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

export function formatDateSeparator(date: Date): string {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const messageDate = new Date(date);
	messageDate.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);
	yesterday.setHours(0, 0, 0, 0);

	if (messageDate.getTime() === today.getTime()) {
		return 'Сегодня';
	}
	if (messageDate.getTime() === yesterday.getTime()) {
		return 'Вчера';
	}
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long'
	}).format(date);
}

export function formatFullDate(date: Date): string {
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export function shouldShowDateSeparator(
	current: number | Date | undefined | null,
	previous: number | Date | undefined | null
): boolean {
	if (!current) {
		return false;
	}
	if (!previous) {
		return true;
	}

	const d1 = current instanceof Date ? current : new Date(current);
	const d2 = previous instanceof Date ? previous : new Date(previous);

	return (
		d1.getFullYear() !== d2.getFullYear() ||
		d1.getMonth() !== d2.getMonth() ||
		d1.getDate() !== d2.getDate()
	);
}
