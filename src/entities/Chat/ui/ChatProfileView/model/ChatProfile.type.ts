export type MessageWithAttachments = {
	attachments?: {
		id: string;
		url: string;
		type: 'image' | 'video' | string;
		created_at: string;
	}[];
};

export interface ChatNotificationsState {
	enabled: boolean;
}

export interface ChatMediaItem {
	id: string;
	url: string;
	type: 'image' | 'video';
	createdAt: string;
}

export interface ChatFileItem {
	uid: string;
	name: string;
	url: string;
	type: string;
	size: number;
	createdAt: string;
}

export interface ChatLinkItemForwardedIn {
	id: number;
	uid: string;
	from_user: string;
}

export interface ChatLinkItem {
	url: string;
	title: string;
	from_user: {
		first_name: string;
		last_name: string;
	};
	message_id: number;
	forwarded_in: ChatLinkItemForwardedIn[];
	created_at: string;
	updated_at: string;
}

export interface ChatVoiceItem {
	uid: string;
	url: string;
	createdAt: string;
}
