export interface ContactsSchema {
	uid: string;
	owner_user: string;
	system_contact: {
		uid: string;
		avatar: string | undefined;
		avatar_url: string | undefined;
		avatar_webp: string | undefined;
		avatar_webp_url: string | undefined;
		avatar_small_url: string | undefined;
		avatar_master_url: string | undefined;
		is_online: boolean;
		was_online_at: number | undefined;
		is_deleted: boolean | false;
	};
	first_name: string;
	last_name: string;
	phone: string;
	is_in_contacts?: boolean;
	created_at?: number;
}

export interface AddContactByPhoneRequest {
	phone: string;
	first_name: string;
	last_name: string;
}

export interface AddContactResponse {
	uid: string;
	owner_user: string;
	system_contact: ContactsSchema['system_contact'];
	first_name: string;
	last_name: string;
	phone: string;
	is_in_contacts?: boolean;
	created_at?: number;
}

export interface ContactValidationError {
	[field: string]: string[];
}
export interface ContactAuthError {
	detail: string;
}

export type AddContactApiResponse =
	| AddContactResponse
	| ContactValidationError
	| ContactAuthError;

export interface GetContactsRequest {
	pageSize?: number;
	ordering?: string;
	search?: string;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export interface CheckContactRequest {
	phone_or_nickname: string;
}

export interface ContactReadByUid {
	uid: string; // UUID
	first_name: string;
	last_name: string;
}

export interface PaginatedContactReadByUidList {
	count: number;
	next: string | null;
	previous: string | null;
	results: ContactReadByUid[];
}

export interface DeleteContactResponse {
	message: string;
	deleted_uid: string;
}

export interface BulkDeleteRequest {
	contact_uids: string[];
}

export interface BulkDeleteResponse {
	message: string;
	deleted_count: number;
	deleted_uids: string[];
}
//  Запрос массового удаления
export interface BulkDeleteRequest {
	contact_uids: string[];
}

// Ответ массового удаления
export interface PaginatedContactReadByUidList {
	count: number;
	next: string | null;
	previous: string | null;
	results: ContactReadByUid[];
}

export interface ContactReadByUid {
	uid: string;
	first_name: string;
	last_name: string;
}

/**
 * Результат глобального поиска (/contact/check/list/)
 * Плоская структура, без обёртки system_contact
 */
export interface GlobalSearchContact {
	uid: string;
	username?: string;
	nickname?: string;
	phone?: string;
	first_name: string;
	last_name: string;
	avatar?: string | null;
	avatar_url?: string | null;
	avatar_webp?: string | null;
	avatar_webp_url?: string | null;
	avatar_small_url?: string | null;
	avatar_master_url?: string | null;
	additional_information?: string;
	birthday?: string;
	chat_id?: number;
	is_online: boolean;
	was_online_at?: number;
	is_deleted?: boolean;
}

/**
 * Пагинированный ответ глобального поиска
 */
export interface GlobalSearchResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: GlobalSearchContact[];
}
