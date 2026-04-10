export interface ProfileSchema {
	uid?: string;
	username: string;
	nickname?: string;
	first_name: string;
	last_name: string;
	patronymic?: string;
	additional_information?: string;
	birthday?: number;
	email?: string;
	gender?: 'male' | 'female' | '';
	gender_label: string;
	country?: string;
	country_label: string;
	city_id?: number | null;
	city: string;
	phone?: string;
	avatar: string | null;
	avatar_url: string | null;
	avatar_webp: string | null;
	avatar_webp_url: string | null;
	is_filled: boolean;
	is_staff: boolean;
	error: null | string;
	isLoading: boolean;
	file_url?: string;
}

export interface CustomStylesOptions {
	hasError?: boolean;
}

export interface RawProfileResponse {
	uid?: string;
	username?: string;
	nickname?: string;
	first_name?: string;
	last_name?: string;
	patronymic?: string;
	email?: string;
	phone?: string;
	avatar?: string | null;
	avatar_url?: string | null;
	avatar_webp?: string | null;
	avatar_webp_url?: string | null;
	is_filled?: boolean;
	is_staff?: boolean;
	// Если бэк вкладывает данные в user/data:
	user?: RawProfileResponse;
	data?: RawProfileResponse;
	// Разрешаем остальные поля, если бэк отдаёт больше
	[key: string]: unknown;
}
