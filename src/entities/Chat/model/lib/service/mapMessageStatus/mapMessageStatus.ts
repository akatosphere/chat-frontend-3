import { MessageStatus } from '../../../types/chat.types/chat.types';

export type BubbleStatus = 'received' | 'sending' | 'unread' | 'read';

/**
 * Конвертирует доменный MessageStatus в UI-формат для MessageBubble
 */
export function toBubbleStatus(
	status: MessageStatus,
	isOutgoing: boolean
): BubbleStatus {
	// Входящие сообщения — всегда без галочек
	if (!isOutgoing) {
		return 'received';
	}

	// Исходящие — маппим на визуальные состояния
	switch (status) {
		case MessageStatus.READ:
			return 'read'; // ✓✓
		case MessageStatus.SENT:
		case MessageStatus.DELIVERED:
			return 'unread'; // ✓
		case MessageStatus.SENDING:
		case MessageStatus.ERROR:
		default:
			return 'sending'; // ⏳
	}
}
