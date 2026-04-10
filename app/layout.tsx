import { OnlineChecker } from '@/app/providers/OnlineChecker';
import { StoreProvider } from '@/app/providers/StoreProvider';
import type { Metadata } from 'next';
import { roboto, sfPro } from '../public/assets/fonts/index';
import '@/app/styles/index.scss';

export const metadata: Metadata = {
	title: 'Мессенджер | А-Чат',
	keywords:
		'Удобный мессенджер, А-Чат, мессенджер А-Чат, мессенджер для связи, мессенджер для работы, мессенджер для общения',
	description: 'Мессенджер на все случаи жизни| А-Чат',

	icons: {
		icon: '/favicon.ico',
		apple: [
			{
				url: '/favicon/apple-touch-icon-152x152.png',
				sizes: '152x152',
				type: 'image/png'
			}
		]
	},

	manifest: '/manifest.json'
};

interface IChildren {
	children: React.ReactNode;
}

export default function RootLayout({ children }: IChildren) {
	return (
		<html
			lang='ru'
			className={`${roboto.variable} ${sfPro.variable}`}
			suppressHydrationWarning
		>
			<head>
				{/* ОСНОВНАЯ ФАВИКОНКА для Яндекс Браузера */}
				<link rel='icon' href='/favicon.ico' type='image/x-icon' />
				<link rel='icon' type='image/svg+xml' href='/favicon/favicon.svg' />
				<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon' />

				{/* Дополнительные размеры */}
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicon/favicon-32x32.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicon/favicon-16x16.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='96x96'
					href='/favicon/favicon-96x96.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='196x196'
					href='/favicon/favicon-196x196.png'
				/>

				{/* Apple Touch Icons - только существующие */}
				<link
					rel='apple-touch-icon'
					sizes='57x57'
					href='/favicon/apple-touch-icon-57x57.png'
				/>
				<link
					rel='apple-touch-icon'
					sizes='60x60'
					href='/favicon/apple-touch-icon-60x60.png'
				/>
				<link
					rel='apple-touch-icon'
					sizes='72x72'
					href='/favicon/apple-touch-icon-72x72.png'
				/>
				<link
					rel='apple-touch-icon'
					sizes='76x76'
					href='/favicon/apple-touch-icon-76x76.png'
				/>
				<link
					rel='apple-touch-icon'
					sizes='114x114'
					href='/favicon/apple-touch-icon-114x114.png'
				/>
				<link
					rel='apple-touch-icon'
					sizes='120x120'
					href='/favicon/apple-touch-icon-120x120.png'
				/>
				<link
					rel='apple-touch-icon'
					sizes='144x144'
					href='/favicon/apple-touch-icon-144x144.png'
				/>
				<link
					rel='apple-touch-icon'
					sizes='152x152'
					href='/favicon/apple-touch-icon-152x152.png'
				/>

				{/* Windows Tiles */}
				<meta name='msapplication-TileColor' content='#FFFFFF' />
				<meta
					name='msapplication-TileImage'
					content='/favicon/mstile-144x144.png'
				/>
				<meta name='application-name' content='А-Чат' />
				<meta
					name='msapplication-square70x70logo'
					content='/favicon/mstile-70x70.png'
				/>
				<meta
					name='msapplication-square150x150logo'
					content='/favicon/mstile-150x150.png'
				/>
				<meta
					name='msapplication-wide310x150logo'
					content='/favicon/mstile-310x150.png'
				/>
				<meta
					name='msapplication-square310x310logo'
					content='/favicon/mstile-310x310.png'
				/>
			</head>
			<body>
				<StoreProvider>
					<OnlineChecker>{children}</OnlineChecker>
				</StoreProvider>
			</body>
		</html>
	);
}
