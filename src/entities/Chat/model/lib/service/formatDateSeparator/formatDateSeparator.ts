// src/shared/lib/date-formatting.ts

/**
 * Форматирует дату для разделителя сообщений в чате
 * - Сегодня / Вчера
 * - "24 октября" — если дата в текущем году
 * - "30 декабря 2023" — если дата в прошлом году
 */
export function formatDateSeparator(date: Date): string {
	const today = new Date();
	const messageDate = new Date(date);

	// Сбрасываем время для корректного сравнения дат
	const normalizeDate = (d: Date) => {
		const normalized = new Date(d);
		normalized.setHours(0, 0, 0, 0);
		return normalized;
	};

	const normalizedToday = normalizeDate(today);
	const normalizedMessage = normalizeDate(messageDate);
	const normalizedYesterday = new Date(normalizedToday);
	normalizedYesterday.setDate(normalizedYesterday.getDate() - 1);

	// Сегодня
	if (normalizedMessage.getTime() === normalizedToday.getTime()) {
		return 'Сегодня';
	}

	// Вчера
	if (normalizedMessage.getTime() === normalizedYesterday.getTime()) {
		return 'Вчера';
	}

	// Форматируем дату
	const currentYear = today.getFullYear();
	const messageYear = messageDate.getFullYear();

	// Если год отличается от текущего — добавляем год
	if (messageYear !== currentYear) {
		return new Intl.DateTimeFormat('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(messageDate);
	}

	// Текущий год — без года
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long'
	}).format(messageDate);
}

/**
 * Форматирует время сообщения (ЧЧ:ММ)
 */
export function formatMessageTime(date: Date): string {
	return new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

/**
 * Проверяет, находятся ли две даты в одном дне
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

/**
 * Определяет, нужно ли показать разделитель даты
 * (если текущее сообщение не в том же дне, что и предыдущее)
 */
export function shouldShowDateSeparator(
	currentDate: Date,
	previousDate?: Date
): boolean {
	if (!previousDate) {
		return true;
	}
	return !isSameDay(currentDate, previousDate);
}

/**
 * Хелпер для получения «липкого» заголовка даты
 * Возвращает дату, которая должна быть зафиксирована при скролле
 */
export function getStickyDateHeader(
	messages: Array<{ id: string; createdAt: Date }>,
	scrollTop: number,
	messageHeights: Map<string, number>,
	containerOffset: number = 0
): Date | null {
	let accumulatedHeight = 0;
	let currentDate: Date | undefined = undefined;

	for (const message of messages) {
		const height = messageHeights.get(message.id) ?? 0;
		const messageTop = accumulatedHeight + containerOffset;
		const messageBottom = messageTop + height;

		// Если сообщение ещё не ушло за верх экрана — это наша дата
		if (messageBottom > scrollTop + 20) {
			// 20px отступ от верха
			// Проверяем, не является ли это сообщением-разделителем
			if (shouldShowDateSeparator(message.createdAt, currentDate)) {
				return message.createdAt;
			}
			currentDate = message.createdAt;
		}

		accumulatedHeight += height;
	}

	return null;
}
