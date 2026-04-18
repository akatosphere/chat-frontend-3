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
		() => (mediaItems.length ? mediaItems : []),
		[mediaItems]
	);
	const memoFiles = useMemo(
		() => (fileItems.length ? fileItems : []),
		[fileItems]
	);
	const memoVoice = useMemo(
		() => (voiceItems.length ? voiceItems : []),
		[voiceItems]
	);
	const memoLinks = useMemo(
		() => (linkItems.length ? linkItems : []),
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
							return (
								<VoiceMedia
									key={voice.uid}
									url={voice.url}
									createdAt={formatDate(voice.createdAt)}
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
