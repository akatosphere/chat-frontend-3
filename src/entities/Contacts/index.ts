// ─── Компоненты ────────────────────────────────────────────────

export { ContactsList } from './ui/ContactsList/ContactsList';
export { ContactsListContent } from './ui/ContactsListContent/ContactsListContent';
export { ContactsListItem } from './ui/ContactsItem/ContactsItem';

// ─── ОСНОВНЫЕ ТИПЫ КОНТАКТОВ ───────────────────────────────────────────
export type {
	ContactsSchema,
	GetContactsRequest
} from './model/types/contacts.types/contacts.types';

// ─── ПАГИНАЦИЯ (универсальный тип) ─────────────────────────────────────
export type { PaginatedResponse } from './model/types/contacts.types/contacts.types';

// ─── ДОБАВЛЕНИЕ КОНТАКТА: ЗАПРОСЫ/ОТВЕТЫ ───────────────────────────────
export type {
	AddContactByPhoneRequest,
	AddContactResponse,
	ContactValidationError,
	ContactAuthError,
	AddContactApiResponse
} from './model/types/contacts.types/contacts.types';

// ─── УДАЛЕНИЕ КОНТАКТОВ ────────────────────────────────────────────────
export type {
	DeleteContactResponse,
	BulkDeleteRequest,
	BulkDeleteResponse
} from './model/types/contacts.types/contacts.types';

// ─── ГЛОБАЛЬНЫЙ ПОИСК: ТИПЫ ────────────────────────────────────────────
export type {
	CheckContactRequest,
	GlobalSearchContact,
	GlobalSearchResponse
} from './model/types/contacts.types/contacts.types';

// ─── ВСПОМОГАТЕЛЬНЫЕ ТИПЫ (для массовых операций) ──────────────────────
export type {
	ContactReadByUid,
	PaginatedContactReadByUidList
} from './model/types/contacts.types/contacts.types';

// ─── API & Hooks ───────────────────────────────────────────────
export {
	contactApi,
	useGetContactsQuery,
	useLazyGetContactsQuery,
	useAddContactByPhoneMutation
} from './api/contactsApi';
