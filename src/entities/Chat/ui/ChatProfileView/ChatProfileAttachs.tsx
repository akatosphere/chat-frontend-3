import { useMemo, useState } from 'react';
import Image from 'next/image';

import {
	ChatFileItem,
	ChatLinkItem,
	ChatMediaItem,
	ChatVoiceItem
} from './model/ChatProfile.type';

import s from './ChatProfileView.module.scss';
import { FileMedia } from './FileMedia';
import { VoiceMedia } from './VoiceMedia';
import { LinkMedia } from './LinkMedia';

const mockMediaItems: ChatMediaItem[] = [
	{
		id: 'm1',
		url: 'https://picsum.photos/id/1015/300/200',
		type: 'image',
		createdAt: '1739188800'
	},
	{
		id: 'm2',
		url: 'https://picsum.photos/id/237/300/200',
		type: 'image',
		createdAt: '1739102400'
	},
	{
		id: 'm3',
		url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
		type: 'video',
		createdAt: '1739016000'
	},
	{
		id: 'm4',
		url: 'https://picsum.photos/id/201/300/200',
		type: 'image',
		createdAt: '1738929600'
	}
];

const mockFileItems: ChatFileItem[] = [
	{
		uid: 'f1',
		name: 'Skolkovo_Отчёт_2023_screen.pdf',
		url: '#',
		type: 'application/pdf',
		size: 16500000,
		createdAt: '1739188800'
	},
	{
		uid: 'f2',
		name: 'Презентация_проекта_v2.key',
		url: '#',
		type: 'application/keynote',
		size: 29800000,
		createdAt: '1739102400'
	},
	{
		uid: 'f3',
		name: 'Договор_№128_от_15.01.2025.pdf',
		url: '#',
		type: 'application/pdf',
		size: 3350000,
		createdAt: '1739016000'
	},
	{
		uid: 'f4',
		name: 'Фото_с_мероприятия.zip',
		url: '#',
		type: 'application/zip',
		size: 130700000,
		createdAt: '1738660800'
	}
];

const mockVoiceItems: ChatVoiceItem[] = [
	{
		uid: 'v1',
		url: '#',
		createdAt: '1739275200'
	},
	{
		uid: 'v2',
		url: '#',
		createdAt: '1739188800'
	},
	{
		uid: 'v3',
		url: '#',
		createdAt: '1739102400'
	}
];

const mockLinkItems: ChatLinkItem[] = [
	{
		url: 'https://example.com/article1',
		title: 'First Article Title',
		from_user: {
			first_name: 'John',
			last_name: 'Doe'
		},
		message_id: 123,
		forwarded_in: [
			{
				id: 456,
				uid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
				from_user: 'Alice Smith'
			}
		],
		created_at: '1744915200', // '2026-04-17T18:00:00Z'
		updated_at: '1744915200'
	},
	{
		url: 'https://example.com/news2',
		title: 'Latest News Update',
		from_user: {
			first_name: 'Jane',
			last_name: 'Smith'
		},
		message_id: 124,
		forwarded_in: [],
		created_at: '1744909200', // '2026-04-17T17:00:00Z'
		updated_at: '1744909200'
	},
	{
		url: 'https://github.com/project/repo',
		title: 'GitHub Repository Link',
		from_user: {
			first_name: 'Bob',
			last_name: 'Johnson'
		},
		message_id: 125,
		forwarded_in: [],
		created_at: '1744905600', // '2026-04-17T16:00:00Z'
		updated_at: '1744905600'
	}
];

interface ChatProfileAttachsProps {
	mediaItems?: ChatMediaItem[];
	fileItems?: ChatFileItem[];
	voiceItems?: ChatVoiceItem[];
	linkItems?: ChatLinkItem[];
}

type TabKey = 'media' | 'files' | 'voice' | 'links';

export const ChatProfileAttachs = ({
	mediaItems = [],
	fileItems = [],
	voiceItems = [],
	linkItems = []
}: ChatProfileAttachsProps) => {
	const [activeTab, setActiveTab] = useState<TabKey>('media');

	const memoMedia = useMemo(
		() => (mediaItems.length ? mediaItems : mockMediaItems),
		[mediaItems]
	);
	const memoFiles = useMemo(
		() => (fileItems.length ? fileItems : mockFileItems),
		[fileItems]
	);
	const memoVoice = useMemo(
		() => (voiceItems.length ? voiceItems : mockVoiceItems),
		[voiceItems]
	);
	const memoLinks = useMemo(
		() => (linkItems.length ? linkItems : mockLinkItems),
		[linkItems]
	);

	const tabs: { key: TabKey; label: string }[] = [
		{ key: 'media', label: 'Медиа' },
		{ key: 'files', label: 'Файлы' },
		{ key: 'voice', label: 'Голосовые' },
		{ key: 'links', label: 'Ссылки' }
	];

	const formatDate = (timestamp: string): string => {
		const date = new Date(Number(timestamp) * 1000);
		return date.toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const activeData = useMemo(() => {
		switch (activeTab) {
			case 'media':
				return memoMedia;
			case 'files':
				return memoFiles;
			case 'voice':
				return memoVoice;
			case 'links':
				return memoLinks;
			default:
				return [];
		}
	}, [activeTab, memoMedia, memoFiles, memoVoice, memoLinks]);

	return (
		<div>
			<nav className={s.tabs}>
				<ul className={s.tabsList}>
					{tabs.map(tab => (
						<li
							key={tab.key}
							className={`${s.tab} ${activeTab === tab.key ? s.activeTab : ''}`}
						>
							<button onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
							<div className={s.tabIndicator} />
						</li>
					))}
				</ul>
			</nav>

			<div className={s.tabContent}>
				{activeTab === 'media' && (
					<div className={s.media}>
						{(activeData as ChatMediaItem[]).map(item =>
							item.type === 'image' ? (
								<Image
									key={item.id}
									src={item.url}
									alt=''
									fill
									className={s.mediaItem}
								/>
							) : (
								<video
									key={item.id}
									src={item.url}
									className={s.mediaItem}
									controls
									preload='metadata'
								/>
							)
						)}
					</div>
				)}

				{activeTab === 'files' && (
					<div className={`${s.files} ${s.list}`}>
						{(activeData as ChatFileItem[]).map(file => (
							<FileMedia
								key={file.uid}
								filename={file.name}
								size={`${(file.size / (1024 * 1024)).toFixed(1)} МБ`}
								date={formatDate(file.createdAt)}
							/>
						))}
					</div>
				)}

				{activeTab === 'voice' && (
					<div className={`${s.voice} ${s.list}`}>
						{(activeData as ChatVoiceItem[]).map(voice => {
							const isMine = true; // временно
							return (
								<VoiceMedia
									key={voice.uid}
									uid={voice.uid}
									url={voice.url}
									createdAt={formatDate(voice.createdAt)}
									name={isMine ? 'Вы' : 'Неизвестный'}
								/>
							);
						})}
					</div>
				)}

				{activeTab === 'links' && (
					<div className={`${s.links} ${s.list}`}>
						{(activeData as ChatLinkItem[]).map(link => {
							return (
								<LinkMedia
									key={link.url}
									url={link.url}
									name={`${link.from_user.first_name} ${link.from_user.last_name}`}
									createdAt={formatDate(link.created_at)}
								/>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};
