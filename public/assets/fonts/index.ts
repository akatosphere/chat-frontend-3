import localFont from 'next/font/local';

export const roboto = localFont({
	src: [
		{
			path: './Roboto-Regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: './Roboto-Regular.woff',
			weight: '400',
			style: 'normal'
		},
		{
			path: './Roboto-Medium.woff2',
			weight: '500',
			style: 'normal'
		},
		{
			path: './Roboto-Medium.woff',
			weight: '500',
			style: 'normal'
		},
		{
			path: './Roboto-Semi-bold.woff2',
			weight: '600',
			style: 'normal'
		},
		{
			path: './Roboto-Semi-bold.woff',
			weight: '600',
			style: 'normal'
		},
		{
			path: './Roboto-Bold.woff2',
			weight: '700',
			style: 'normal'
		},
		{
			path: './Roboto-Bold.woff',
			weight: '700',
			style: 'normal'
		},
		{
			path: './Roboto-Extra-bold.woff2',
			weight: '800',
			style: 'normal'
		},
		{
			path: './Roboto-Extra-bold.woff',
			weight: '800',
			style: 'normal'
		}
	],
	variable: '--primary-text-font',
	display: 'swap'
});

export const sfPro = localFont({
	src: [
		{
			path: './SFProDisplay-Regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: './SFProDisplay-Regular.woff',
			weight: '400',
			style: 'normal'
		}
	],
	variable: '--secondary-text-font',
	display: 'swap'
});
