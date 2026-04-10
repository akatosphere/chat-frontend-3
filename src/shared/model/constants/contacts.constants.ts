// ─────────────────────────────────────────────────────────────
//  КОНТАКТЫ: ПАГИНАЦИЯ И СОРТИРОВКА
// ─────────────────────────────────────────────────────────────

/**
 * Количество контактов на странице
 */
export const CONTACTS_PAGE_SIZE = 30;

/**
 * Сортировка списка контактов
 */
export const CONTACTS_ORDERING = '-created_at' as const;
export type ContactsOrdering = typeof CONTACTS_ORDERING;

// ─────────────────────────────────────────────────────────────
//  КОНТАКТЫ: ПОИСК
// ─────────────────────────────────────────────────────────────

/**
 * Минимальная длина запроса для глобального поиска
 */
export const CONTACTS_GLOBAL_SEARCH_MIN_LENGTH = 3;

/**
 * Префикс для активации глобального поиска
 */
export const CONTACTS_GLOBAL_SEARCH_PREFIX = '@' as const;

/**
 * Задержка дебунса для поиска (мс)
 */
export const CONTACTS_SEARCH_DEBOUNCE_MS = 300;

// ─────────────────────────────────────────────────────────────
//  ОБЪЕКТЫ С ДЕФОЛТАМИ (для удобства)
// ─────────────────────────────────────────────────────────────

export const CONTACTS_QUERY_DEFAULTS = {
	pageSize: CONTACTS_PAGE_SIZE,
	ordering: CONTACTS_ORDERING
} as const;

export const CONTACTS_SEARCH_DEFAULTS = {
	minLength: CONTACTS_GLOBAL_SEARCH_MIN_LENGTH,
	prefix: CONTACTS_GLOBAL_SEARCH_PREFIX,
	debounceMs: CONTACTS_SEARCH_DEBOUNCE_MS
} as const;
