// src/entities/Chat/model/lib/service/dateFormating/dateFormater.ts

// ✅ Форматирование времени (без изменений)
export function formatMessageTime(date: Date): string {
	return new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

// ✅ Форматирование разделителя дат (без изменений)
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

// ✅ Полная дата (без изменений)
export function formatFullDate(date: Date): string {
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

// ✅ isSameDay: принимает Date (без изменений)
export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

// 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ: конвертируем number → Date перед isSameDay
export function shouldShowDateSeparator(
	currentDate: number, // ✅ timestamp
	previousDate?: number // ✅ timestamp
): boolean {
	if (previousDate === undefined || previousDate === null) {
		return true;
	}

	// ✅ Конвертируем timestamp в Date для isSameDay
	const current = new Date(currentDate);
	const previous = new Date(previousDate);

	return !isSameDay(current, previous);
}
