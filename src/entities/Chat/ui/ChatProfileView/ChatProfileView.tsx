import { useGetContactByUidQuery } from '../../api/chatApi';
import { Close, CopyMessage, MenuIcon } from '@icons/index';
import s from './ChatProfileView.module.scss';

interface ChatProfileViewProps {
	userUid: string;
}

function formatDateRu(unixDate: string) {
	const date = new Date(unixDate);
	const day = String(date.getDate()).padStart(2, '0');
	const months = [
		'января',
		'февраля',
		'марта',
		'апреля',
		'мая',
		'июня',
		'июля',
		'августа',
		'сентября',
		'октября',
		'ноября',
		'декабря'
	];

	return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export const ChatProfileView = ({ userUid }: ChatProfileViewProps) => {
	const { data, isLoading, error } = useGetContactByUidQuery(userUid);

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
		const notifications_on = true;

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

				<div className={s.notifications}>
					<p>Уведомления</p>
					<button>
						<svg width='60' height='48' viewBox='0 0 60 48' fill='none'>
							<rect
								y='8'
								width='52'
								height='32'
								rx='16'
								fill={notifications_on ? '#7769E1' : '#b3b3b3'}
							/>
							<rect
								x={notifications_on ? '24' : '4'}
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
				</div>

				<div>
					<nav className={s.tabs}>
						<ul className={s.tabsList}>
							{['Медиа', 'Файлы', 'Голосовые', 'Ссылки'].map((tab, i) => (
								<li
									key={tab}
									className={`${s.tab} ${i === 0 ? s.activeTab : ''}`}
								>
									<button>{tab}</button>
									<div className={s.tabIndicator} />
								</li>
							))}
						</ul>
					</nav>
					<div className={s.gallery}>{/* галерея */}</div>
				</div>
			</div>
		);
	}

	if (!data) {
		return <p>Передан неверный ID пользователя</p>;
	}
};
