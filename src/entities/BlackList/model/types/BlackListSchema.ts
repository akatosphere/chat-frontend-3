export interface BlackListUser {
	uid: string;
	username: string;
	nickname: string;
	phone: string;
	first_name: string;
	last_name: string;
	avatar: string;
	avatar_url: string;
	avatar_webp: string;
	avatar_webp_url: string;
	avatar_small_url?: string;
	avatar_master_url?: string;
	additional_information: string;
	birthday: string;
	chat_id: number;
	is_online: boolean;
	was_online_at: number;
	is_deleted?: boolean;
}

export interface BlackListSchema {
	blocked_user: BlackListUser;
}

export interface BlackListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: BlackListSchema[];
}
