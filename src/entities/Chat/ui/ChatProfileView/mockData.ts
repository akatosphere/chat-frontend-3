import {
	ChatFileItem,
	ChatLinkItem,
	ChatMediaItem,
	ChatVoiceItem
} from './model/ChatProfile.type';

export const mockMediaItems: ChatMediaItem[] = [
	{
		id: '1',
		url: 'https://picsum.photos/300/200',
		type: 'image',
		createdAt: '2024-03-01T10:00:00Z'
	},
	{
		id: '2',
		url: 'https://picsum.photos/300/201',
		type: 'image',
		createdAt: '2024-03-02T12:30:00Z'
	},
	{
		id: '3',
		url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
		type: 'video',
		createdAt: '2024-03-03T15:45:00Z'
	}
];

export const mockFileItems: ChatFileItem[] = [
	{
		uid: 'f1',
		name: 'resume.pdf',
		url: 'https://example.com/files/resume.pdf',
		type: 'application/pdf',
		size: 245760,
		createdAt: '2024-03-01T09:00:00Z'
	},
	{
		uid: 'f2',
		name: 'design.fig',
		url: 'https://example.com/files/design.fig',
		type: 'application/octet-stream',
		size: 1048576,
		createdAt: '2024-03-02T11:20:00Z'
	},
	{
		uid: 'f3',
		name: 'notes.txt',
		url: 'https://example.com/files/notes.txt',
		type: 'text/plain',
		size: 1024,
		createdAt: '2024-03-03T14:10:00Z'
	}
];

export const mockVoiceItems: ChatVoiceItem[] = [
	{
		uid: 'v1',
		url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
		createdAt: '2024-03-01T08:00:00Z'
	},
	{
		uid: 'v2',
		url: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
		createdAt: '2024-03-02T10:15:00Z'
	},
	{
		uid: 'v3',
		url: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3',
		createdAt: '2024-03-03T13:25:00Z'
	}
];

export const mockLinkItems: ChatLinkItem[] = [
	{
		url: 'https://google.com',
		title: 'Google',
		from: 'Иван Иванов',
		createdAt: '2024-03-01T07:00:00Z'
	},
	{
		url: 'https://github.com',
		title: 'GitHub',
		from: 'Петр Петров',
		createdAt: '2024-03-02T09:40:00Z'
	},
	{
		url: 'https://stackoverflow.com',
		title: 'Stack Overflow',
		from: 'Анна Смирнова',
		createdAt: '2024-03-03T12:55:00Z'
	}
];
