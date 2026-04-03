// ─── Компоненты ────────────────────────────────────────────────

export { ContactsListItem } from './ui/ContactsItem/ContactsItem';
export { ContactsList } from './ui/ContactsList/ContactsList';
export { ContactsListContent } from './ui/ContactsListContent/ContactsListContent';

// ─── ОСНОВНЫЕ ТИПЫ КОНТАКТОВ ───────────────────────────────────────────
export type {
	ContactsSchema,
	GetContactsRequest
} from './model/types/contacts.types/contacts.types';

// ─── ПАГИНАЦИЯ (универсальный тип) ─────────────────────────────────────
export type { PaginatedResponse } from './model/types/contacts.types/contacts.types';

// ─── ДОБАВЛЕНИЕ КОНТАКТА: ЗАПРОСЫ/ОТВЕТЫ ───────────────────────────────
export type {
	AddContactApiResponse,
	AddContactByPhoneRequest,
	AddContactResponse,
	ContactAuthError,
	ContactValidationError
} from './model/types/contacts.types/contacts.types';

// ─── УДАЛЕНИЕ КОНТАКТОВ ────────────────────────────────────────────────
export type {
	BulkDeleteRequest,
	BulkDeleteResponse,
	DeleteContactResponse
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
	useAddContactByPhoneMutation,
	useGetContactsQuery,
	useLazyGetContactsQuery,
	useLazySearchGlobalContactsQuery
} from './api/contactsApi';
