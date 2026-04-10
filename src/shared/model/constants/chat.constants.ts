// ─────────────────────────────────────────────────────────────
//  СПИСОК ЧАТОВ (каналов/диалогов)
// ─────────────────────────────────────────────────────────────

/**
 * Количество чатов на странице в списке
 */
export const CHATS_PAGE_SIZE = 30;

/**
 * Сортировка списка чатов: по последней активности
 */
export const CHATS_ORDERING = '-last_activity_at' as const;
export type ChatsOrdering = typeof CHATS_ORDERING;

// ─────────────────────────────────────────────────────────────
//  СООБЩЕНИЯ ВНУТРИ ЧАТА
// ─────────────────────────────────────────────────────────────

/**
 * Количество сообщений на странице в чате
 */
export const MESSAGES_PAGE_SIZE = 30;

/**
 * Сортировка сообщений: новые сверху
 */
export const MESSAGES_ORDERING = '-created_at' as const;
export type MessageOrdering = typeof MESSAGES_ORDERING;

// ─────────────────────────────────────────────────────────────
//  ОБЪЕКТЫ С ДЕФОЛТАМИ (для удобства)
// ─────────────────────────────────────────────────────────────

export const CHATS_QUERY_DEFAULTS = {
	pageSize: CHATS_PAGE_SIZE,
	ordering: CHATS_ORDERING
} as const;

export const MESSAGES_QUERY_DEFAULTS = {
	page_size: MESSAGES_PAGE_SIZE,
	ordering: MESSAGES_ORDERING
} as const;
