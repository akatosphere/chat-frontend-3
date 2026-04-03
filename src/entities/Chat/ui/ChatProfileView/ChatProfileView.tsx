import {
	useGetContactByUidQuery,
	useGetMessagesQuery,
	useGetFilesQuery,
	useGetLinksQuery,
	selectChatByUid
} from '../../api/chatApi';
import { formatDateRu } from './lib/formatDateRu';

import { useSelector } from 'react-redux';
import { RootState } from '@/app/providers/StoreProvider';

import {
	ChatFileItem,
	ChatLinkItem,
	ChatMediaItem,
	ChatNotificationsState,
	ChatVoiceItem,
	MessageWithAttachments
} from './model/ChatProfile.type';

import { ChatProfileAttachs } from './ChatProfileAttachs';
import { Text, TextColor } from '@/shared/ui/Text';
import { Close, CopyMessage, MenuIcon } from '@icons/index';

import s from './ChatProfileView.module.scss';

import {
	mockMediaItems,
	mockFileItems,
	mockVoiceItems,
	mockLinkItems
} from './mockData';

interface ChatProfileViewProps {
	userUid: string;
}

export const ChatProfileView = ({ userUid }: ChatProfileViewProps) => {
	// todo
	// добавить адаптивность
	// кнопка добавить в контакты
	// кнопка разблокировать

	const { data, isLoading } = useGetContactByUidQuery(userUid);
	const chat = useSelector((state: RootState) =>
		selectChatByUid(state, userUid)
	);

	const { data: messages } = useGetMessagesQuery({ user_uid: userUid });
	const { data: filesResponse } = useGetFilesQuery({ user_uid: userUid });
	const { data: linksResponse } = useGetLinksQuery({ user_uid: userUid });

	/**
	 * notificationsState
	 * Источник: chat.list
	 * Поле: chat.notifications
	 */
	const notificationsState: ChatNotificationsState = {
		enabled: chat?.notifications ?? false
	};
	const notificationsOn = notificationsState.enabled;

	/**
	 * mediaItems
	 * Источник: messages
	 * Берем вложения (attachments) и фильтруем image/video
	 */
	const mediaItems: ChatMediaItem[] =
		messages?.results
			.flatMap(m => (m as MessageWithAttachments).attachments ?? [])
			.filter(a => a.type === 'image' || a.type === 'video')
			.map(a => ({
				id: a.id,
				url: a.url,
				type: a.type as 'image' | 'video',
				createdAt: a.created_at
			})) ?? [];

	/**
	 * fileItems
	 * Источник: GET /chat/message/files/{user_uid}
	 */
	const fileItems: ChatFileItem[] =
		filesResponse?.results.map(f => ({
			uid: f.uid,
			name: f.download_name,
			url: f.file_url,
			type: f.file_type,
			size: f.size,
			createdAt: f.created_at
		})) ?? [];

	/**
	 * linkItems
	 * Источник: GET /chat/message/links/{user_uid}
	 */
	const linkItems: ChatLinkItem[] =
		linksResponse?.results.map(l => ({
			url: l.url,
			title: l.title,
			from: `${l.from_user.first_name} ${l.from_user.last_name}`,
			createdAt: l.created_at
		})) ?? [];

	/**
	 * voiceItems
	 * Источник: files
	 * Фильтрация по audio
	 */
	const voiceItems: ChatVoiceItem[] =
		filesResponse?.results
			.filter(f => f.media_kind === 'audio' || f.file_type?.includes('audio'))
			.map(f => ({
				uid: f.uid,
				url: f.file_url,
				createdAt: f.created_at
			})) ?? [];

	if (isLoading) {
		return (
			<div className={s.emptyState}>
				<Text color={TextColor.GRAY}>Загружаем данные пользователя...</Text>
			</div>
		);
	}

	if (!data) {
		return (
			<div className={s.emptyState}>
				<Text color={TextColor.ERROR}>Ошибка загрузки пользователя</Text>
			</div>
		);
	}

	if (data) {
		const was_online_at = data.was_online_at;
		const status = data.is_online
			? 'в сети'
			: was_online_at
				? `был(а) ${new Date(was_online_at * 1000).toLocaleTimeString('ru-RU', {
						hour: '2-digit',
						minute: '2-digit'
					})}`
				: 'не в сети';

		const birthday = formatDateRu(data.birthday);

		const rows = [
			{ label: 'Никнейм', value: `@${data.nickname}`, type: 'primary' },
			{ label: 'Номер телефона', value: data.username, type: 'primary' },
			{ label: 'День рождения', value: birthday, type: 'default' },
			{ label: 'О себе', value: data.additional_information, type: 'default' }
		];

		return (
			<div className={s.container}>
				<div className={s.header}>
					<div className={s.headerLeft}>
						<Close className={s.closeIcon} />
						<p className={s.title}>Информация</p>
					</div>
					<MenuIcon className={s.menuIcon} />
				</div>

				{/* <div
					className={s.profile}
					style={{
						backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0) 50%),
							${data.avatar_url ? `url(${data.avatar_url})` : `url(/images/png/NoAvatarAvatar.png)`}`
					}}
				>
					<p className={s.name}>
						{data.first_name} {data.last_name}
					</p>
					<p className={s.status}>{status}</p>
				</div>

				<div className={s.notifications}>
					<p>Уведомления</p>
					<button>
						<svg width='60' height='48' viewBox='0 0 60 48' fill='none'>
							<rect
								y='8'
								width='52'
								height='32'
								rx='16'
								fill={notificationsOn ? '#7769E1' : '#b3b3b3'}
							/>
							<rect
								x={notificationsOn ? '24' : '4'}
								y='12'
								width='24'
								height='24'
								rx='12'
								fill='white'
							/>
						</svg>
					</button>
				</div>

				<div className={s.card}>
					{rows.map(
						(item, i) =>
							item.value && (
								<div key={i} className={s.row}>
									<div className={s.rowText}>
										<p className={s.label}>{item.label}</p>
										<p
											className={
												item.type === 'primary'
													? s.valuePrimary
													: s.valueDefault
											}
										>
											{item.value}
										</p>
									</div>
									{item.type === 'primary' && (
										<button className={s.copyIcon}>
											<CopyMessage />
										</button>
									)}
								</div>
							)
					)}
				</div> */}

				<ChatProfileAttachs
					mediaItems={mockMediaItems}
					fileItems={mockFileItems}
					voiceItems={mockVoiceItems}
					linkItems={mockLinkItems}
				/>
			</div>
		);
	}
};
