import { Close, CopyMessage, MenuIcon } from '@icons/index';
import Image from 'next/image';
import s from './ProfileView.module.scss';

const DATA = {
	avatar_src:
		'https://i.pinimg.com/736x/cb/cf/3f/cbcf3ff1a7cd2359a8f382260b312167.jpg',
	name: 'Алексей Смирнов',
	status: 'в сети',
	notifications_on: true,
	username: '@alex_alex',
	phone_number: '+7 000 000 00 00',
	birthday: '20 августа 1998',
	about: 'Художник из Санкт-Петербурга, пишу картины на заказ'
};

const rows = [
	{ label: 'Никнейм', value: DATA.username, type: 'primary' },
	{ label: 'Номер телефона', value: DATA.phone_number, type: 'primary' },
	{ label: 'День рождения', value: DATA.birthday, type: 'default' },
	{ label: 'О себе', value: DATA.about, type: 'default' }
];

const images = Array.from({ length: 7 }, () => DATA.avatar_src);

export const ProfileView = () => {
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
					backgroundImage: `url(${DATA.avatar_src})`
				}}
			>
				<p className={s.name}>{DATA.name}</p>
				<p className={s.status}>{DATA.status}</p>
			</div>

			<div className={s.notifications}>
				<p>Уведомления</p>
				<button>
					<svg width='60' height='48' viewBox='0 0 60 48' fill='none'>
						<rect y='8' width='52' height='32' rx='16' fill='#7769E1' />
						<rect x='24' y='12' width='24' height='24' rx='12' fill='white' />
					</svg>
				</button>
			</div>

			<div className={s.card}>
				{rows.map((item, i) => (
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
				))}
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
				<div className={s.gallery}>
					{images.map((src, i) => (
						<img key={i} src={src} alt='' />
					))}
				</div>
			</div>
		</div>
	);
};
