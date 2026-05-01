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

	const tabs = useMemo(() => {
		const result: { key: TabKey; label: string }[] = [];

		if (mediaItems.length) {
			result.push({ key: 'media', label: 'Медиа' });
		}
		if (fileItems.length) {
			result.push({ key: 'files', label: 'Файлы' });
		}
		if (voiceItems.length) {
			result.push({ key: 'voice', label: 'Голосовые' });
		}
		if (linkItems.length) {
			result.push({ key: 'links', label: 'Ссылки' });
		}

		return result;
	}, [mediaItems, fileItems, voiceItems, linkItems]);

	const currentTab: TabKey | null =
		tabs.find(t => t.key === activeTab)?.key ?? tabs[0]?.key ?? null;

	if (!tabs.length || !currentTab) {
		return null;
	}

	const formatDate = (timestamp: string): string => {
		const date = new Date(Number(timestamp) * 1000);
		return date.toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const getActiveData = () => {
		switch (currentTab) {
			case 'media':
				return mediaItems;
			case 'files':
				return fileItems;
			case 'voice':
				return voiceItems;
			case 'links':
				return linkItems;
		}
	};

	const activeData = getActiveData();

	return (
		<div>
			<nav className={s.tabs}>
				<ul className={s.tabsList}>
					{tabs.map(tab => (
						<li
							key={tab.key}
							className={`${s.tab} ${currentTab === tab.key ? s.activeTab : ''}`}
						>
							<button onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
							<div className={s.tabIndicator} />
						</li>
					))}
				</ul>
			</nav>

			<div className={s.tabContent}>
				{currentTab === 'media' && (
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

				{currentTab === 'files' && (
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

				{currentTab === 'voice' && (
					<div className={`${s.voice} ${s.list}`}>
						{(activeData as ChatVoiceItem[]).map(voice => (
							<VoiceMedia
								key={voice.uid}
								url={voice.url}
								createdAt={formatDate(voice.createdAt)}
							/>
						))}
					</div>
				)}

				{currentTab === 'links' && (
					<div className={`${s.links} ${s.list}`}>
						{(activeData as ChatLinkItem[]).map(link => (
							<LinkMedia
								key={link.url}
								url={link.url}
								name={`${link.from_user.first_name} ${link.from_user.last_name}`}
								createdAt={formatDate(link.created_at)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
