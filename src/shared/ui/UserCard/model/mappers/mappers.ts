import { BlackListSchema } from '@/entities/BlackList';
import { ChatItemSchema } from '@/entities/Chat';
import { ContactsSchema } from '@/entities/Contacts';
import { ProfileSchema } from '@/entities/Profile';
import { IUserCard } from '../types/IUserCard';

export const mapChatToUserCard = (user: ChatItemSchema): IUserCard => ({
	user: {
		uid: user.chat.uid,
		username: user.chat.username,
		nickname: user.chat.nickname,
		first_name: user.chat.first_name,
		last_name: user.chat.last_name,
		avatar: user.chat.avatar,
		avatar_url: user.chat.avatar_url,
		avatar_webp: user.chat.avatar_webp,
		avatar_webp_url: user.chat.avatar_webp_url,
		is_online: user.chat.is_online,
		was_online_at: user.chat.was_online_at
	},
	notifications: user.notifications,
	is_favorite: user.is_favorite,
	new_message_count: user.new_message_count,
	chat_type: user.chat_type,
	chat_key: user.chat_key,

	last_message: user.last_message
		? {
				id: user.last_message.id,
				uid: user.last_message.uid,

				from_user:
					typeof user.last_message.from_user === 'string'
						? user.last_message.from_user
						: user.last_message.from_user?.uid || '',
				content: user.last_message.content,
				files_summary: user.last_message.files_summary || {
					types: [],
					count: 0
				},
				has_replied_message: user.last_message.has_replied_message || false,
				has_forwarded_message: user.last_message.has_forwarded_message || false,
				new: user.last_message.new,
				created_at: user.last_message.created_at,
				updated_at: user.last_message.updated_at
			}
		: undefined
});

export const mapContactToUserCard = (user: ContactsSchema): IUserCard => ({
	user: {
		uid: user.uid,
		first_name: user.first_name,
		last_name: user.last_name,
		avatar: user.system_contact.avatar,
		avatar_url: user.system_contact.avatar_url,
		avatar_webp: user.system_contact.avatar_webp,
		avatar_webp_url: user.system_contact.avatar_webp_url,
		is_online: user.system_contact.is_online,
		was_online_at: user.system_contact.was_online_at,
		phone: user.phone
	}
});

export const mapBlackListToUserCard = (user: BlackListSchema): IUserCard => ({
	user: {
		uid: user.uid,
		username: user.username,
		nickname: user.nickname,
		first_name: user.first_name,
		last_name: user.last_name,
		avatar: user.avatar,
		avatar_url: user.avatar_url,
		avatar_webp: user.avatar_webp,
		avatar_webp_url: user.avatar_webp_url,
		is_online: user.is_online,
		was_online_at: user.was_online_at,
		phone: user.phone
	}
});

export const mapProfileToUserCard = (user: ProfileSchema): IUserCard => ({
	user: {
		username: user.username,
		avatar: user.avatar ?? undefined,
		avatar_url: user.avatar_url ?? undefined,
		avatar_webp: user.avatar_webp ?? undefined,
		avatar_webp_url: user.avatar_webp_url ?? undefined,
		nickname: user.nickname,
		first_name: user.first_name,
		last_name: user.last_name,
		patronymic: user.patronymic,
		additional_information: user.additional_information,
		birthday: user.birthday,
		email: user.email,
		gender: user.gender === '' ? undefined : user.gender,
		country: user.country,
		city_id: user.city_id === null ? undefined : user.city_id,
		phone: user.phone
	}
});
