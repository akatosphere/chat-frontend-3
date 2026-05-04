export type RequestUID = string;

export interface WSRequest<T = unknown> {
	action?: string;
	request_uid?: RequestUID;
	object?: T;
}

export interface WSResponse<T = unknown> {
	action: string;
	request_uid: RequestUID;
	status: 'OK' | 'error';
	error?: string;
	object?: T;
	code?: number;
}

export interface ChangeStatusReadResponse {
	id: number;
	uid: string;
	from_user: { uid: string };
	to_user: { uid: string };
	new: boolean;
	created_at: string;
	updated_at: string;
	chat_data: {
		chat_key: string;
		chat_type: string;
	};
	reader_uid: string;
}

// Все твои actions
export enum WS_ACTIONS {
	CONNECT = '_connect',
	ADD_MEMBERS_TO_CHAT = 'add_members_to_chat',
	CHANGE_STATUS_READ_MESSAGE = 'change_status_read_message',
	CREATE_CHAT = 'create_chat',
	CREATE_TEXT_MESSAGE = 'create_text_message',
	DELETE_CHAT = 'delete_chat',
	DELETE_MESSAGE = 'delete_message',
	EDIT_CHAT = 'edit_chat',
	GET_STATUS_LIST_CHAT = 'get_status_list_chat',
	JOIN_BY_INVITE_LINK = 'join_by_invite_link',
	LEAVE_CHAT = 'leave_chat',
	REMOVE_MEMBERS_FROM_CHAT = 'remove_members_from_chat',
	SELF_JOIN_CHAT = 'self_join_chat',
	TRANSFER_OWNER = 'transfer_owner',
	UPDATE_MESSAGE = 'update_message'
}

export type AuthResponse = {
	access?: string;
	accessToken?: string;
	token?: string;
	refresh?: string;

	expiresIn?: number;
	expires_in?: number;
	exp?: number;

	success?: boolean;

	data?: {
		access?: string;
		accessToken?: string;
		expiresIn?: number;
	};

	[key: string]: unknown;
};
