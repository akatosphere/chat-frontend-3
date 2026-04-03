export interface IUserCard {
	user?: UserCardInfo;
	notifications?: boolean;
	is_favorite?: boolean;
	new_message_count?: number;
	chat_type?: ChatType;
	chat_key?: string;
	last_message?: LastMessage;
	// phone?: string;
}

interface UserCardInfo extends UserCardForProfile {
	uid?: string;
	username?: string;
	nickname?: string; // @bda777
	first_name: string;
	last_name: string;
	avatar?: string;
	avatar_url?: string;
	avatar_webp?: string;
	avatar_webp_url?: string;
	is_online?: boolean;
	was_online_at?: number;
	phone?: string;
}

interface LastMessage {
	id: number;
	uid: string;
	from_user: string;
	content: string;
	files_summary: {
		types: string[];
		count: number;
	};
	has_replied_message: boolean;
	has_forwarded_message: boolean;
	new: boolean;
	created_at: number;
	updated_at: number;
}

enum ChatType {
	CHAT = 'chat',
	GROUP = 'group',
	CHANNEL = 'channel',
	PUBLIC_GROUP = 'public-group',
	PRIVATE_GROUP = 'private-group',
	PUBLIC_CHANNEL = 'public-channel',
	PRIVATE_CHANNEL = 'private-channel'
}

interface UserCardForProfile {
	nickname?: string;
	first_name?: string;
	last_name?: string;
	patronymic?: string;
	additional_information?: string;
	birthday?: number;
	email?: string;
	gender?: 'male' | 'female';
	country?: string;
	city_id?: number;
}

export enum UserCardType {
	CHAT = 'chat',
	CONTACT = 'contact',
	BLACK_LIST = 'blackList',
	PROFILE = 'profile'
}

export const AVATAR_SIZE: Record<UserCardType, number> = {
	[UserCardType.CHAT]: 60,
	[UserCardType.CONTACT]: 40,
	[UserCardType.BLACK_LIST]: 40,
	[UserCardType.PROFILE]: 82
};
