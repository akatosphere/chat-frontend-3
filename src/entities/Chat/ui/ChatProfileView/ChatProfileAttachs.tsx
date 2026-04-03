import { useMemo, useState } from 'react';

import {
	ChatFileItem,
	ChatLinkItem,
	ChatMediaItem,
	ChatVoiceItem
} from './ChatProfile.type';

import s from './ChatProfileView.module.scss';

interface ChatProfileAttachsProps {
	mediaItems: ChatMediaItem[];
	fileItems: ChatFileItem[];
	voiceItems: ChatVoiceItem[];
	linkItems: ChatLinkItem[];
}

type TabKey = 'media' | 'files' | 'voice' | 'links';

const renderMediaItem = (item: ChatMediaItem) => {
	if (item.type === 'image') {
		return <img src={item.url} alt='' className={s.mediaItem} loading='lazy' />;
	}

	if (item.type === 'video') {
		return (
			<video
				src={item.url}
				className={s.mediaItem}
				controls
				preload='metadata'
			/>
		);
	}

	return null;
};

export const ChatProfileAttachs = ({
	mediaItems,
	fileItems,
	voiceItems,
	linkItems
}: ChatProfileAttachsProps) => {
	// todo
	// если данных нет то вкладку не показывать

	const [activeTab, setActiveTab] = useState<TabKey>('media');

	const memoMedia = useMemo(() => mediaItems, [mediaItems]);
	const memoFiles = useMemo(() => fileItems, [fileItems]);
	const memoVoice = useMemo(() => voiceItems, [voiceItems]);
	const memoLinks = useMemo(() => linkItems, [linkItems]);

	const tabs: { key: TabKey; label: string }[] = [
		{ key: 'media', label: 'Медиа' },
		{ key: 'files', label: 'Файлы' },
		{ key: 'voice', label: 'Голосовые' },
		{ key: 'links', label: 'Ссылки' }
	];

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
				{activeTab === 'media' ? (
					<div className={s.media}>
						{(activeData as ChatMediaItem[]).map(item =>
							item.type === 'image' ? (
								<img
									key={item.id}
									src={item.url}
									className={s.mediaItem}
									loading='lazy'
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
				) : (
					<pre>{JSON.stringify(activeData, null, 2)}</pre>
				)}
			</div>
		</div>
	);
};
