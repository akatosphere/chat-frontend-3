// ─────────────────────────────────────────────────────────────
//  CHAT VIEW: UI & BEHAVIOR
// ─────────────────────────────────────────────────────────────

/**
 * Длительность подсветки найденного сообщения (мс)
 */
export const MESSAGE_HIGHLIGHT_DURATION = 2500;

/**
 * Порог скролла для кнопки "вниз" (пиксели от низа)
 */
export const SCROLL_BOTTOM_THRESHOLD = 50;

/**
 * Задержка для авто-скролла после загрузки сообщений (мс)
 */
export const AUTO_SCROLL_DELAY = 100;

/**
 * Количество вложенных requestAnimationFrame для надёжного скролла
 */
export const SCROLL_RAF_COUNT = 2;

// ─────────────────────────────────────────────────────────────
//  ОБЪЕКТ С ДЕФОЛТАМИ
// ─────────────────────────────────────────────────────────────

export const CHAT_VIEW_CONFIG = {
	highlightDuration: MESSAGE_HIGHLIGHT_DURATION,
	scrollThreshold: SCROLL_BOTTOM_THRESHOLD,
	autoScrollDelay: AUTO_SCROLL_DELAY,
	rafCount: SCROLL_RAF_COUNT
} as const;
