// ============================================================================
//  БАЗОВЫЕ ТИПЫ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

export interface BaseUser {
	uid: string;
	username?: string;
	nickname?: string;
	first_name: string;
	last_name: string;
	patronymic?: string;
	avatar_url: string | null;
	avatar_webp_url: string | null;
	avatar_small_url?: string | null;
	avatar_master_url?: string | null;
	is_deleted?: boolean;
}

export interface ChatUser extends BaseUser {
	is_online: boolean;
	was_online_at: number; // timestamp
	is_in_contacts: boolean;
	is_blocked: boolean;
}

// ============================================================================
//  ТИПЫ ДЛЯ ПОИСКА ПО СООБЩЕНИЯМ (useMessageSearch)
// ============================================================================

/**
 * Базовый интерфейс сообщения для поиска
 * Используется внутри useMessageSearch хука
 */
export interface BaseSearchMessage {
	id: string;
	type: MessageType;
	createdAt: number;
	updatedAt?: number;
}

/**
 * Текстовое сообщение для поиска
 * Отличается от ChatMessage структурой полей (плоская, для удобства фильтрации)
 */
export interface TextMessage extends BaseSearchMessage {
	type: MessageType.TEXT;
	content: string;
	senderId: string;
	senderName: string;
	status: MessageStatus;
	isEdited?: boolean;
	has_replied_message?: boolean;
	has_forwarded_message?: boolean;
	replyTo?: {
		id: string;
		text: string;
		senderName?: string;
	};
	forwardedFrom?: {
		chatName: string;
		author: string;
		messageText?: string;
	};
	files_summary?: FilesSummary;
	new?: boolean;
}

/**
 * Объединённый тип сообщения для поиска
 * Discriminated union по полю `type`
 */
export type Message = TextMessage | SystemMessageData;

// ============================================================================
// ВЛОЖЕНИЯ (ФАЙЛЫ)
// ============================================================================

export interface FileAttachment {
	id: number;
	uid: string;
	file_url: string;
	file_webp_url?: string;
	file_type: string;
	created_at: string;
	updated_at: string;
}

export type FilesSummary = {
	types: string[];
	count: number;
};

// ============================================================================
//  СООБЩЕНИЯ: ФРОНТЕНД-ФОРМАТ (после маппинга)
// ============================================================================

/**
 * Сообщение в удобном для фронтенда формате
 * Используется в компонентах, селекторах, сторе
 */
export interface ChatMessage {
	id: number;
	uid: string;
	from_user: string;
	content: string;
	files_summary: FilesSummary;
	has_replied_message: boolean;
	has_forwarded_message: boolean;
	new: boolean;
	created_at: number;
	updated_at: number;
	type?: MessageType;
}

// ============================================================================
//  СООБЩЕНИЯ: RAW-ФОРМАТ (прямой ответ от API, до маппинга)
// ============================================================================

/**
 * Превью сообщения для реплаев/пересылок (упрощённый формат из API)
 */
export interface MessagePreview {
	id: number;
	uid: string;
	is_deleted?: boolean;
	from_user: string;
	first_name: string;
	last_name: string;
	content: string;
	files_list: FileAttachment[];
}

export interface ForwardedMessagePreview extends MessagePreview {
	avatar_webp_url?: string;
}

/**
 * Метаданные RTC-звонка
 */
export interface RTCMessageMeta {
	uid: string;
	duration: number;
	status: 'initiated' | 'accepted' | 'missed' | 'declined' | 'ended';
	created_at: string;
	updated_at: string;
}

/**
 * Сырое сообщение из API (соответствует Swagger)
 * Используется ТОЛЬКО внутри transformResponse
 */
export interface RawApiChatMessage {
	id: number;
	uid: string;

	//  Участники (полные объекты из бэка)
	from_user: ChatUser;
	to_user?: ChatUser;

	//  Контент
	content: string;

	//  Вложения (полный массив)
	files_list: FileAttachment[];

	//  Реплаи и пересылки (массивы превью)
	replied_messages: MessagePreview[];
	forwarded_messages: ForwardedMessagePreview[];

	//  Метаданные звонков
	message_rtc?: RTCMessageMeta | null;

	//  Контекст чата
	chat_id?: number;
	chat_key?: string;
	chat_type?: ChatType;

	//  Статусы
	new: boolean;
	is_deleted?: boolean;

	//  Даты (ISO strings от бэка)
	created_at: string;
	updated_at: string;
}

export interface AddContactByPhoneRequest {
	phone: string;
	first_name: string;
	last_name: string;
}

export interface AddContactResponse {
	success: boolean;
	contact?: {
		uid: string;
		username: string;
		first_name: string;
		last_name: string;
		avatar_url: string | null;
		is_in_contacts: boolean;
	};
}

// ============================================================================
//  ЧАТЫ: ОСНОВНЫЕ ТИПЫ
// ============================================================================

export enum ChatType {
	CHAT = 'chat',
	GROUP = 'group',
	CHANNEL = 'channel',
	PUBLIC_GROUP = 'public-group',
	PRIVATE_GROUP = 'private-group',
	PUBLIC_CHANNEL = 'public-channel',
	PRIVATE_CHANNEL = 'private-channel'
}

export interface Chat {
	id: number;
	chat: ChatUser;
	is_group: boolean;
	is_favorite: boolean;
	notifications: boolean;
	new_message_count: number;
	name: string;
	chat_type: ChatType;
	chat_key: string;
	last_activity_at: number;
	last_seen_message: ChatMessage | null;
	last_message: ChatMessage | null;
	first_new_message: ChatMessage | null;
}

// ============================================================================
//  API-ЗАПРОСЫ И ОТВЕТЫ
// ============================================================================

// ─── Список чатов ─────────────────────────────────────────────────────
export interface ChatListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: Chat[];
}

export interface GetChatsRequest {
	pageSize?: number;
	ordering?: string;
	page?: number;
	search?: string;
	isBlocked?: boolean;
	isFavorite?: boolean;
	isActive?: boolean;
}

// ─── Сообщения: RAW-ответ от API (до маппинга) ─────────────────────────
export interface RawMessageListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: RawApiChatMessage[];
}

// ─── Сообщения: ФРОНТЕНД-ответ (после маппинга) ────────────────────────
export interface MessageListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: ChatMessage[];
}

export interface GetMessagesRequest {
	user_uid: string;
	page?: number;
	page_size?: number;
	ordering?: '-created_at' | 'created_at';
	search?: string;
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ТИПЫ (для UI-компонентов)
// ============================================================================

export interface ChatItemInfo {
	uid: string;
	username: string;
	nickname: string;
	first_name: string;
	last_name: string;
	avatar: string;
	avatar_url: string;
	avatar_webp: string;
	avatar_webp_url: string;
	is_blocked: boolean;
	is_online: boolean;
	was_online_at: number;
	is_in_contacts: boolean;
}

export interface ChatItemSchema {
	id: number;
	chat: ChatItemInfo;
	is_favorite: boolean;
	notifications: boolean;
	new_message_count: number;
	new_file_count: number;
	name: string;
	chat_type: ChatType;
	chat_key: string;
	last_activity_at: number;
	last_seen_message: { id: number; uid: string };
	first_new_message: { id: number; uid: string };
	last_message: {
		id: number;
		uid: string;
		from_user: string;
		content: string;
		files_summary: FilesSummary;
		has_replied_message: boolean;
		has_forwarded_message: boolean;
		new: boolean;
		created_at: number;
		updated_at: number;
	};
}

// ============================================================================
//  СИСТЕМНЫЕ СООБЩЕНИЯ И СОБЫТИЯ (опционально, если используются)
// ============================================================================

export enum MessageType {
	TEXT = 'text',
	IMAGE = 'image',
	VIDEO = 'video',
	AUDIO = 'audio',
	FILE = 'file',
	SYSTEM = 'system'
}

export enum MessageStatus {
	RECEIVED = 'received',
	SENDING = 'sending',
	SENT = 'sent',
	DELIVERED = 'delivered',
	READ = 'read',
	ERROR = 'error'
}

export enum SystemEventType {
	DATE_SEPARATOR = 'date_separator',
	CHAT_CREATED = 'chat_created',
	CHANNEL_CREATED = 'channel_created',
	CHAT_DELETED = 'chat_deleted',
	MEMBER_JOINED = 'member_joined',
	MEMBER_LEFT = 'member_left',
	MEMBER_KICKED = 'member_kicked',
	MEMBER_INVITED = 'member_invited',
	CHAT_NAME_CHANGED = 'chat_name_changed',
	CHAT_PHOTO_CHANGED = 'chat_photo_changed',
	MESSAGE_PINNED = 'message_pinned',
	MESSAGE_UNPINNED = 'message_unpinned',
	PERMISSIONS_CHANGED = 'permissions_changed',
	ADMIN_ADDED = 'admin_added',
	ADMIN_REMOVED = 'admin_removed'
}

// ============================================================================
// 🔧 СИСТЕМНЫЕ СООБЩЕНИЯ: МИНИМАЛЬНЫЕ ТИПЫ (для SystemMessage компонента)
// ============================================================================

/**
 * Базовый интерфейс для данных системного события
 * Гибкая структура — конкретные поля определяются в типах ниже
 */
export interface SystemEventPayload {
	[key: string]: unknown;
}

/**
 * Данные события: создание чата/канала
 */
export interface ChatCreatedData {
	name: string;
	ownerFullName: string;
	// Опциональные поля, если бэк их отдаёт
	description?: string;
	chatType?: ChatType;
}

/**
 * Данные события: участник присоединился
 */
export interface MemberJoinedData {
	userName: string;
	joinType: 'self' | 'invited' | 'added';
	inviterName?: string;
}

/**
 * Данные события: участник приглашён
 */
export interface MemberInvitedData {
	inviterName: string;
	invitedUserName: string;
}

/**
 * Данные события: участник покинул чат
 */
export interface MemberLeftData {
	userName: string;
}

/**
 * Данные события: участник удалён
 */
export interface MemberKickedData {
	userName: string;
	kickerName: string;
}

/**
 * Данные события: название чата изменено
 */
export interface ChatNameChangedData {
	oldName: string;
	newName: string;
	changedByUserName: string;
}

/**
 * Данные события: сообщение закреплено
 */
export interface MessagePinnedData {
	pinnedByUserName: string;
	messageContent?: string;
}

/**
 * Объединённый тип для eventData в системном сообщении
 * Discriminated union по eventType
 */
export type SystemEventData =
	| {
			type: SystemEventType.CHAT_CREATED | SystemEventType.CHANNEL_CREATED;
			payload: ChatCreatedData;
	  }
	| { type: SystemEventType.MEMBER_JOINED; payload: MemberJoinedData }
	| { type: SystemEventType.MEMBER_INVITED; payload: MemberInvitedData }
	| { type: SystemEventType.MEMBER_LEFT; payload: MemberLeftData }
	| { type: SystemEventType.MEMBER_KICKED; payload: MemberKickedData }
	| { type: SystemEventType.CHAT_NAME_CHANGED; payload: ChatNameChangedData }
	| { type: SystemEventType.MESSAGE_PINNED; payload: MessagePinnedData }
	| { type: SystemEventType.DATE_SEPARATOR; payload: { label: string } }
	| {
			type: Exclude<
				SystemEventType,
				| SystemEventType.CHAT_CREATED
				| SystemEventType.CHANNEL_CREATED
				| SystemEventType.MEMBER_JOINED
				| SystemEventType.MEMBER_INVITED
				| SystemEventType.MEMBER_LEFT
				| SystemEventType.MEMBER_KICKED
				| SystemEventType.CHAT_NAME_CHANGED
				| SystemEventType.MESSAGE_PINNED
				| SystemEventType.DATE_SEPARATOR
			>;
			payload: SystemEventPayload;
	  };

/**
 * Системное сообщение для UI-компонентов
 * Простой плоский интерфейс — без наследования от BaseMessage
 */
export interface SystemMessageData {
	id: string;
	type: MessageType.SYSTEM;
	createdAt: number;
	eventType: SystemEventType;
	eventData: SystemEventData;
	displayText?: string;
}

// ============================================================================
//  УТИЛИТЫ
// ============================================================================

export const getFilesSummary = (
	files: readonly FileAttachment[]
): FilesSummary => {
	const types = [...new Set(files.map(f => f.file_type))].slice(0, 3);
	return { types, count: files.length };
};

export const parseIsoDateToTimestamp = (isoDate: string): number => {
	const timestamp = new Date(isoDate).getTime();
	return Number.isNaN(timestamp) ? 0 : timestamp;
};
