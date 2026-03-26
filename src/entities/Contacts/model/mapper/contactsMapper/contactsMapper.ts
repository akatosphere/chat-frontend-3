import type {
	ContactsSchema,
	GlobalSearchContact
} from '../../types/contacts.types/contacts.types';
import type { IUserCard } from '@/shared/ui/UserCard';

// ─── Маппер для контактов из списка (messenger-list) ─────────────
export const mapContactToUserCard = (contact: ContactsSchema): IUserCard => ({
	user: {
		uid: contact.uid,
		first_name: contact.first_name,
		last_name: contact.last_name,
		phone: contact.phone,
		avatar: contact.system_contact.avatar ?? undefined,
		avatar_url: contact.system_contact.avatar_url ?? undefined,
		avatar_webp: contact.system_contact.avatar_webp ?? undefined,
		avatar_webp_url: contact.system_contact.avatar_webp_url ?? undefined,
		is_online: contact.system_contact.is_online,
		was_online_at: contact.system_contact.was_online_at
			? Math.floor(contact.system_contact.was_online_at / 1000)
			: undefined,
		nickname: undefined,
		patronymic: undefined
	}
});

/**
 * Маппинг глобального поиска → формат, совместимый с ContactsSchema
 * Для использования с sortContactsByStatus и filterContactsWrapper
 */
export const mapGlobalSearchToContactsSchema = (
	contact: GlobalSearchContact
): ContactsSchema => ({
	uid: contact.uid,
	owner_user: '',
	system_contact: {
		uid: contact.uid,
		avatar: contact.avatar ?? undefined,
		avatar_url: contact.avatar_url ?? undefined,
		avatar_webp: contact.avatar_webp ?? undefined,
		avatar_webp_url: contact.avatar_webp_url ?? undefined,
		avatar_small_url: contact.avatar_small_url ?? undefined,
		avatar_master_url: contact.avatar_master_url ?? undefined,
		is_online: contact.is_online,
		was_online_at: contact.was_online_at ?? 0,
		is_deleted: contact.is_deleted ?? false
	},
	first_name: contact.first_name,
	last_name: contact.last_name,
	phone: contact.phone ?? ''
});

// ─── Маппер для глобального поиска (check/list) ──────────────
export const mapGlobalSearchToUserCard = (
	contact: GlobalSearchContact
): IUserCard => ({
	user: {
		uid: contact.uid,
		first_name: contact.first_name,
		last_name: contact.last_name,
		phone: contact.phone,

		// Аватары: берём из плоской структуры
		avatar: contact.avatar ?? undefined,
		avatar_url: contact.avatar_url ?? undefined,
		avatar_webp: contact.avatar_webp ?? undefined,
		avatar_webp_url: contact.avatar_webp_url ?? undefined,

		// Онлайн-статус
		is_online: contact.is_online,
		was_online_at: contact.was_online_at
			? Math.floor(contact.was_online_at / 1000)
			: undefined,
		// Никнейм и доп. поля (только для глобального поиска)
		nickname: contact.nickname,
		patronymic: undefined
	}
});

// ─── Утилита: маппинг списка ───────────────────────────────────
export const mapGlobalSearchList = (
	results: GlobalSearchContact[]
): IUserCard[] => results.map(mapGlobalSearchToUserCard);
