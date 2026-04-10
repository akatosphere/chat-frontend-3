import {
	useGetContactByUidQuery,
	useGetMessagesQuery,
	useGetFilesQuery,
	useGetLinksQuery,
	selectChatByUid,
	useUpdateChatPropertiesMutation
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
import { ActionAdd, Close, CopyMessage, MenuIcon } from '@icons/index';

import s from './ChatProfileView.module.scss';

interface ChatProfileViewProps {
	userUid: string;
}

export const ChatProfileView = ({ userUid }: ChatProfileViewProps) => {
	const { data, isLoading } = useGetContactByUidQuery(userUid);
	const chat = useSelector((state: RootState) =>
		selectChatByUid(state, userUid)
	);

	const { data: messages } = useGetMessagesQuery({ user_uid: userUid });
	const { data: filesResponse } = useGetFilesQuery({ user_uid: userUid });
	const { data: linksResponse } = useGetLinksQuery({ user_uid: userUid });

	// для обновления свойств чата (уведомления)
	const [updateChatProperties] = useUpdateChatPropertiesMutation();

	/**
	 * notificationsState
	 * Источник: chat.list -> chat.notifications
	 */
	const notificationsState: ChatNotificationsState = {
		enabled: chat?.notifications ?? false
	};
	const notificationsOn = notificationsState.enabled;

	/**
	 * Обработчик переключения уведомлений
	 */
	const handleToggleNotifications = async () => {
		if (!chat?.id) {
			console.warn('ID чата не найден - уведомления нельзя переключить');
			return;
		}

		try {
			await updateChatProperties({
				id: chat.id,
				notifications: !notificationsOn
			}).unwrap();
		} catch (error) {
			console.error('Не удалось обновить уведомления:', error);
		}
	};

	/**
	 * mediaItems - изображения и видео из сообщений
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
	 * fileItems - файлы из отдельного эндпоинта
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
	 * linkItems - ссылки из отдельного эндпоинта
	 */
	const linkItems: ChatLinkItem[] =
		linksResponse?.results.map(l => ({
			url: l.url,
			title: l.title,
			from: `${l.from_user.first_name} ${l.from_user.last_name}`,
			createdAt: l.created_at
		})) ?? [];

	/**
	 * voiceItems - голосовые сообщения (фильтр по audio)
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

	// Данные для отображения профиля
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
		{ label: 'Никнейм', value: `@${data.nickname}`, type: 'primary' as const },
		{ label: 'Номер телефона', value: data.username, type: 'primary' as const },
		{ label: 'День рождения', value: birthday, type: 'default' as const },
		{
			label: 'О себе',
			value: data.additional_information,
			type: 'default' as const
		}
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

			{/* Профиль пользователя */}
			<div
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

			{/* Переключатель уведомлений */}
			<div className={s.notifications}>
				<p>Уведомления</p>
				<button
					onClick={handleToggleNotifications}
					className={s.toggleButton}
					aria-label='Переключить уведомления'
				>
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

			{/* Карточка с данными */}
			<div className={s.card}>
				{rows.map(
					(item, i) =>
						item.value && (
							<div key={i} className={s.row}>
								<div className={s.rowText}>
									<p className={s.label}>{item.label}</p>
									<p
										className={
											item.type === 'primary' ? s.valuePrimary : s.valueDefault
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
			</div>

			{/* скрыть если уже в контактах */}
			<button className={s.action} onClick={() => {}}>
				<ActionAdd />
				<span>Добавить в контакты</span>
			</button>

			{/* скрыть если юзер не заблокирован */}
			<button className={s.action} onClick={() => {}}>
				<ActionAdd />
				<span>Разблокировать</span>
			</button>

			{/* Вложения (реальные данные) */}
			<ChatProfileAttachs
				mediaItems={mediaItems}
				fileItems={fileItems}
				voiceItems={voiceItems}
				linkItems={linkItems}
			/>
		</div>
	);
};
