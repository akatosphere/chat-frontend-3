import { Support } from '@/entities/Settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Страница поддержки | А-Чат',
	keywords:
		'Страница поддержки, А-Чат, поддержка пользователя, мессенджер А-Чат, обратиться в поддержку,',
	description: 'Страница поддержки пользователя| А-Чат'
};

export default function SupportPage() {
	return <Support />;
}
