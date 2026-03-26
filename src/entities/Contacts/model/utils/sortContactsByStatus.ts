import { ContactsSchema } from '../types/contacts.types/contacts.types';

/**
 * Сортирует контакты по статусу онлайн/офлайн:
 * 1. Сначала все "в сети" (is_online: true)
 * 2. Затем офлайн-пользователи по was_online_at (от новейшего к старейшему)
 *
 * Соответствует ТЗ:
 * ✅ в сети
 * ✅ был(а) только что
 * ✅ был(а) 22 минуты назад
 * ✅ был(а) 22 часа назад
 * ✅ был(а) вчера в 21:15
 * ✅ был(а) 02.04.24
 */

export const sortContactsByStatus = (
	contacts: ContactsSchema[]
): ContactsSchema[] => {
	return [...contacts].sort((a, b) => {
		const aIsOnline = a.system_contact.is_online;
		const bIsOnline = b.system_contact.is_online;

		if (aIsOnline && !bIsOnline) {
			return -1;
		}
		if (!aIsOnline && bIsOnline) {
			return 1;
		}

		const timeA = a.system_contact.was_online_at ?? 0;
		const timeB = b.system_contact.was_online_at ?? 0;

		return timeB - timeA;
	});
};
