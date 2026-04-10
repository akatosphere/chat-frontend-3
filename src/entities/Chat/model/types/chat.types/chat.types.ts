// ============================================================================
//  1. DOMAIN: БАЗОВЫЕ СУЩНОСТИ
// ============================================================================

// ─── Пользователь ──────────────────────────────────────────────────────────
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
	was_online_at: number;
	is_in_contacts: boolean;
	is_blocked: boolean;
}

// ─── Чат ───────────────────────────────────────────────────────────────────
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

// ─── Сообщения: ФРОНТЕНД-формат (после маппинга) ───────────────────────────
export interface ChatMessage {
	id: number;
	uid: string;
	from_user: string | { uid: string };
	content: string;
	files_summary: FilesSummary;
	has_replied_message: boolean;
	has_forwarded_message: boolean;
	new: boolean;
	created_at: number; // timestamp
	updated_at: number;
	type?: MessageType;
}

// ─── Вложения ──────────────────────────────────────────────────────────────
export interface FileAttachment {
	id: number;
	uid: string;
	file_url: string;
	file_webp_url?: string;
	file_type: string;
	created_at: string; // ISO
	updated_at: string;
}

export interface FilesSummary {
	types: string[];
	count: number;
}

// ============================================================================
//  2. API: RAW-ТИПЫ (ответы бэка, до маппинга)
// ============================================================================

// ─── Превью сообщений (для реплаев/пересылок) ──────────────────────────────
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

// ─── Метаданные звонка ─────────────────────────────────────────────────────
export interface RTCMessageMeta {
	uid: string;
	duration: number;
	status: 'initiated' | 'accepted' | 'missed' | 'declined' | 'ended';
	created_at: string;
	updated_at: string;
}

// ─── Сырое сообщение из API (Swagger) ──────────────────────────────────────
export interface RawApiChatMessage {
	id: number;
	uid: string;
	from_user: ChatUser;
	to_user?: ChatUser;
	content: string;
	files_list: FileAttachment[];
	replied_messages: MessagePreview[];
	forwarded_messages: ForwardedMessagePreview[];
	message_rtc?: RTCMessageMeta | null;
	chat_id?: number;
	chat_key?: string;
	chat_type?: ChatType;
	new: boolean;
	is_deleted?: boolean;
	created_at: string; // ISO
	updated_at: string;
}

// ─── API-ответы ────────────────────────────────────────────────────────────
export interface ChatListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: Chat[];
}

export interface RawMessageListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: RawApiChatMessage[];
}

export interface MessageListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: ChatMessage[];
}

// ─── API-запросы ───────────────────────────────────────────────────────────
export interface GetChatsRequest {
	pageSize?: number;
	ordering?: string;
	page?: number;
	search?: string;
	isBlocked?: boolean;
	isFavorite?: boolean;
	isActive?: boolean;
}

export interface GetMessagesRequest {
	user_uid: string;
	page_size?: number;
	page?: number;
	ordering?: '-created_at' | 'created_at';
	search?: string;
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

export interface UpdateChatPropertiesRequest {
	is_favorite?: boolean;
	notifications?: boolean;
	index?: number;
	last_seen_message?: number | ChatMessage | null;
}

export interface UpdateChatPropertiesResponse {
	is_favorite: boolean;
	notifications: boolean;
	index: number;
	last_seen_message: number | ChatMessage | null;
	last_seen_message_uid: string;
}

// ============================================================================
//  3. UI: ТИПЫ ДЛЯ КОМПОНЕНТОВ
// ============================================================================

// ─── ChatHeader ────────────────────────────────────────────────────────────
export interface ChatHeaderUserData {
	userName: string;
	userStatus: string;
	userAvatar?: string;
	isOnline: boolean;
	isInContacts: boolean;
	contactPhone?: string;
	contactFirstName?: string;
	contactLastName?: string;
}

export interface ChatHeaderSearchConfig {
	query: string;
	onChange: (value: string) => void;
	isVisible: boolean;
	onToggle: () => void;
	results: {
		count: number;
		index: number;
		id?: string;
	};
	navigation: {
		next: () => void;
		prev: () => void;
	};
}

export interface ChatHeaderProps {
	userName?: string;
	userStatus?: string;
	userAvatar?: string;
	isOnline?: boolean;
	isInContacts?: boolean;
	contactPhone?: string;
	contactFirstName?: string;
	contactLastName?: string;
	onCall: () => void;
	onAddToContacts?: () => void;
	onBlock?: () => void;
	onBack?: () => void;
	onActionBarVisibilityChange?: (isVisible: boolean) => void;
	searchQuery?: string;
	onSearchQueryChange?: (value: string) => void;
	isSearchVisible?: boolean;
	onSearchToggle?: () => void;
	searchResultsCount?: number;
	activeResultIndex?: number;
	activeResultId?: string;
	navigateToNext?: () => void;
	navigateToPrev?: () => void;
	onNavigateToMessage?: (messageId: string) => void;
}

// ─── MessageBubble / MessagesList ──────────────────────────────────────────
export interface TextMessageUI {
	id: string;
	uid: string;
	text: string;
	time: number; // timestamp
	status: 'received' | 'sending' | 'unread' | 'read';
}

export type MessageListItem =
	| { type: 'text'; data: TextMessageUI }
	| { type: 'system'; data: SystemMessageData }
	| { type: 'separator'; date: Date; id: string };

export interface ChatPreviewData {
	userName?: string;
	avatar?: string;
	isOnline?: boolean;
}

// ─── ChatItem (для списка чатов) ───────────────────────────────────────────
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
	last_message: ChatMessage;
}

// ============================================================================
//  4. HOOKS: ТИПЫ ДЛЯ КАСТОМНЫХ ХУКОВ
// ============================================================================

export interface BaseSearchMessage {
	id: string;
	uid: string;
	type: MessageType;
	createdAt: number;
	updatedAt?: number;
}

export interface TextMessage extends BaseSearchMessage {
	type: MessageType.TEXT;
	content: string;
	text: string;
	senderId: string;
	senderName: string;
	status: MessageStatus;
	isEdited?: boolean;
	has_replied_message?: boolean;
	has_forwarded_message?: boolean;
	replyTo?: { id: string; text: string; senderName?: string };
	forwardedFrom?: { chatName: string; author: string; messageText?: string };
	files_summary?: FilesSummary;
	new?: boolean;
}

export type Message = TextMessage | SystemMessageData;

export type SearchMessage = Message;

export interface MessageOccurrence {
	messageId: string;
	occurrenceIndex: number;
	globalIndex: number;
	content: string;
	position: number;
}

export interface UseMessageSearchOptions {
	messages: SearchMessage[];
	searchQuery: string;
	caseSensitive?: boolean;
	searchInSender?: boolean;
	searchInSystemText?: boolean;
	debounceDelay?: number;
}

export interface UseMessageSearchReturn {
	filteredMessages: SearchMessage[];
	occurrences: MessageOccurrence[];
	activeOccurrenceIndex: number;
	totalOccurrences: number;
	matchingIndices: number[];
	activeResultIndex: number;
	activeResultId: string | undefined;
	searchResultsCount: number;
	navigateToNext: () => void;
	navigateToPrev: () => void;
	setActiveResultIndex: (index: number) => void;
	getActiveOccurrencesForMessage: (messageId: string) => number[];
}

export interface ApiMessageListResponse {
	results: ChatMessage[];
	next: string | null;
	previous?: string | null;
	count?: number;
}

// ─── useInfiniteScroll ─────────────────────────────────────────────────────
export interface UseInfiniteScrollOptions {
	loadMore: () => Promise<void>;
	onBottomChange?: (isAtBottom: boolean) => void;
	threshold?: number;
	loadThreshold?: number;
}

export interface UseInfiniteScrollReturn {
	scrollRef: React.RefObject<HTMLDivElement | null>;
	anchorRef: React.RefObject<HTMLDivElement | null>;
	isAtBottom: boolean;
	newCount: number;
	scrollToBottom: () => void;
	resetNewCount: () => void;
	incrementNewCount: () => void;
}

// ─── useChatViewData ───────────────────────────────────────────────────────
export interface UseChatViewDataOptions {
	chatUid: string;
	userDataFromSearch?: ChatPreviewData;
	pageSize?: number;
	ordering?: '-created_at' | 'created_at';
}

export interface UseChatViewDataReturn {
	messages: ChatMessage[];
	chatData: Chat | null;
	headerData: SafeHeaderData;
	hasMessages: boolean;
	isLoading: boolean;
	hasError: boolean;
	isForbidden: boolean;
	nextUrl: string | null;
}

// ─── useSafeHeaderData ─────────────────────────────────────────────────────
export interface UseSafeHeaderDataOptions {
	chatUid?: string;
	headerData?: {
		userName?: string;
		userStatus?: string;
		userAvatar?: string;
		isOnline?: boolean;
		isInContacts?: boolean;
	} | null;
	chatData?: Chat | null;
	userDataFromSearch?: ChatPreviewData;
}

export interface SafeHeaderData {
	userName: string;
	userStatus: string;
	userAvatar?: string;
	isOnline: boolean;
	isInContacts: boolean;
	contactPhone?: string;
	contactFirstName?: string;
	contactLastName?: string;
}

// ============================================================================
//  5. SYSTEM MESSAGES: Типы для системных событий
// ============================================================================

export interface SystemEventPayload {
	[key: string]: unknown;
}

export interface ChatCreatedData {
	name: string;
	ownerFullName: string;
	description?: string;
	chatType?: ChatType;
}

export interface MemberJoinedData {
	userName: string;
	joinType: 'self' | 'invited' | 'added';
	inviterName?: string;
}

export interface MemberInvitedData {
	inviterName: string;
	invitedUserName: string;
}

export interface MemberLeftData {
	userName: string;
}

export interface MemberKickedData {
	userName: string;
	kickerName: string;
}

export interface ChatNameChangedData {
	oldName: string;
	newName: string;
	changedByUserName: string;
}

export interface MessagePinnedData {
	pinnedByUserName: string;
	messageContent?: string;
}

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

export interface SystemMessageData {
	id: string;
	type: MessageType.SYSTEM;
	createdAt: number;
	eventType: SystemEventType;
	eventData: SystemEventData;
	displayText?: string;
}

// ============================================================================
//  6. CONSTANTS: Enum'ы и утилиты
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
	UNREAD = 'unread',
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

// ─── Утилиты ───────────────────────────────────────────────────────────────
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

export type MessageFormTypes = {
	message: string;
	file: VoiceFile;
};

export type VoiceFile = {
	filename: string;
	data: string;
	type?: string;
};

export type SendMessageParams = {
	content?: string;
	files?: VoiceFile[];
	replyIds?: string[];
	forwardIds?: string[];
	attachmentUids?: string[];
};
