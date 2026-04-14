import { useMemo, useState } from 'react';

import {
	ChatFileItem,
	ChatLinkItem,
	ChatMediaItem,
	ChatVoiceItem
} from './model/ChatProfile.type';

import s from './ChatProfileView.module.scss';
import { FileMedia } from './FileMedia';

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
		url: 'https://skolkovo.ru',
		title: 'Сайт Сколково',
		from: 'skolkovo.ru',
		createdAt: '1739188800'
	},
	{
		url: 'https://example.com/research-report-2024',
		title: 'Отчёт по исследованию 2024',
		from: 'example.com',
		createdAt: '1738929600'
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
								<img
									key={item.id}
									src={item.url}
									className={s.mediaItem}
									loading='lazy'
									alt=''
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
					<div className={s.files}>
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
					<div className={s.voice}>
						<pre>{JSON.stringify(activeData, null, 2)}</pre>
					</div>
				)}

				{activeTab === 'links' && (
					<div className={s.links}>
						<pre>{JSON.stringify(activeData, null, 2)}</pre>
					</div>
				)}
			</div>
		</div>
	);
};
