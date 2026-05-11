//  Типы для типизации логов
export type LogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';
export type LogCategory = 'ws' | 'auth' | 'api' | 'ui' | 'store' | 'general';

export interface LogOptions {
	category?: LogCategory;
	prefix?: string;
	sendToSentry?: boolean; // для продакшена
}

//  Форматирование сообщения с префиксами
const formatMessage = (
	level: LogLevel,
	message: unknown,
	options?: LogOptions
): unknown[] => {
	const parts: unknown[] = [];

	// Префикс уровня
	const levelPrefix = {
		debug: '🔍',
		info: 'ℹ️',
		log: '💬',
		warn: '⚠️',
		error: '❌'
	}[level];

	parts.push(`[${levelPrefix}]`);

	// Категория
	if (options?.category) {
		parts.push(`[${options.category.toUpperCase()}]`);
	}

	// Кастомный префикс
	if (options?.prefix) {
		parts.push(`[${options.prefix}]`);
	}

	// Само сообщение
	parts.push(message);

	return parts;
};

// Основной экспортер
export const logger = {
	// === Базовые методы (обратная совместимость) ===

	log: (message: unknown, options?: LogOptions) => {
		if (process.env.NODE_ENV === 'development') {
			console.log(...formatMessage('log', message, options));
		}
	},

	warn: (message: unknown, options?: LogOptions) => {
		if (process.env.NODE_ENV === 'development') {
			console.warn(...formatMessage('warn', message, options));
		}
		//  Готовность к продакшену: раскомментируй при подключении Sentry
		// if (process.env.NODE_ENV === 'production' && options?.sendToSentry) {
		//   Sentry.captureMessage(String(message), { level: 'warning', tags: { category: options.category } });
		// }
	},

	error: (message: unknown, options?: LogOptions) => {
		if (process.env.NODE_ENV === 'development') {
			console.error(...formatMessage('error', message, options));
		}
		//  Готовность к продакшену
		// if (process.env.NODE_ENV === 'production' && options?.sendToSentry) {
		//   Sentry.captureException(message instanceof Error ? message : new Error(String(message)), {
		//     tags: { category: options.category },
		//     extra: { rawMessage: message }
		//   });
		// }
	},

	// === Новые методы ===

	/** Отладочные логи — только в dev, не засоряют консоль */
	debug: (message: unknown, options?: LogOptions) => {
		if (process.env.NODE_ENV === 'development') {
			console.debug(
				...formatMessage('debug', message, {
					...options,
					category: options?.category ?? 'general'
				})
			);
		}
	},

	/** Информационные логи — только в dev */
	info: (message: unknown, options?: LogOptions) => {
		if (process.env.NODE_ENV === 'development') {
			console.info(
				...formatMessage('info', message, {
					...options,
					category: options?.category ?? 'general'
				})
			);
		}
	},

	// === WebSocket-специфичные хелперы ===

	/** Ошибка WebSocket с авто-категорией */
	wsError: (message: unknown, prefix?: string) => {
		logger.error(message, { category: 'ws', prefix });
	},

	/** Отладка WebSocket — только в dev */
	wsDebug: (message: unknown, prefix?: string) => {
		logger.debug(message, { category: 'ws', prefix });
	},

	/** Ping/pong логи — очень тихие, только при включённом флаге */
	wsPing: (message: unknown) => {
		if (
			process.env.NODE_ENV === 'development' &&
			process.env.NEXT_PUBLIC_WS_DEBUG === 'true'
		) {
			console.debug('🏓 [WS]', message);
		}
	},

	// === Утилиты ===

	/** Группировка логов (console.group) — только в dev */
	group: (label: string, callback: () => void) => {
		if (process.env.NODE_ENV === 'development' && console.group) {
			console.group(`📦 ${label}`);
			callback();
			console.groupEnd();
		} else {
			callback();
		}
	},

	/** Таблица данных — только в dev */
	table: (data: unknown, label?: string) => {
		if (process.env.NODE_ENV === 'development' && console.table) {
			if (label) {
				console.log(`📊 ${label}`);
			}
			console.table(data);
		}
	},

	/** Время выполнения — только в dev */
	time: (label: string) => {
		if (process.env.NODE_ENV === 'development' && console.time) {
			console.time(`⏱️ ${label}`);
		}
		return () => {
			if (process.env.NODE_ENV === 'development' && console.timeEnd) {
				console.timeEnd(`⏱️ ${label}`);
			}
		};
	}
};
