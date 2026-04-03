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

export interface ChatLinkItem {
	url: string;
	title: string;
	from: string;
	createdAt: string;
}

export interface ChatVoiceItem {
	uid: string;
	url: string;
	createdAt: string;
}
