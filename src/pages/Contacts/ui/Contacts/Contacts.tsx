'use client';

import { memo } from 'react';
import { Container, ContainerType } from '@/shared/ui/Container';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import { ContactsList } from '@/entities/Contacts';
import { Text } from '@/shared/ui/Text';
import { ChatView } from '@/entities/Chat';

import cls from './Contacts.module.scss';

const ContactsPageComponent = () => {
	const params = useParams();
	const router = useRouter();

	//  Получаем chatUid из params (может быть от контакта или из чата)
	const chatUid = params?.uid as string | undefined;
	const isMobile = useMediaQuery();

	// ─────────────────────────────────────────────────────────────
	//  МОБИЛЬНАЯ ЛОГИКА: показываем только один экран
	// ─────────────────────────────────────────────────────────────
	if (isMobile) {
		return (
			<Container type={ContainerType.WRAPPER}>
				{chatUid ? (
					//  Если выбран чат → показываем MessagesPage (CONTENT)
					<Container type={ContainerType.CONTENT}>
						<ChatView
							chatUid={chatUid}
							onBack={() => router.push('/contacts')}
						/>
					</Container>
				) : (
					//  Если чат не выбран → показываем список контактов (SIDEBAR)
					<Container type={ContainerType.SIDEBAR}>
						<ContactsList
							selectedContactUid={null}
							onSelectContact={uid => router.push(`/chats/${uid}`)}
						/>
					</Container>
				)}
			</Container>
		);
	}

	// ─────────────────────────────────────────────────────────────
	//  ДЕСКТОПНАЯ ЛОГИКА: два контейнера рядом
	// ─────────────────────────────────────────────────────────────
	return (
		<Container type={ContainerType.WRAPPER}>
			<Container type={ContainerType.SIDEBAR}>
				<ContactsList
					selectedContactUid={chatUid ?? null}
					onSelectContact={uid => router.push(`/chats/${uid}`)}
				/>
			</Container>

			<Container type={ContainerType.CONTENT}>
				{chatUid ? (
					//  Показываем чат с выбранным контактом
					<ChatView chatUid={chatUid} />
				) : (
					//  Пустое состояние: предложим выбрать контакт
					<div className={cls.emptyState}>
						<Text>Выберите контакт для начала общения</Text>
					</div>
				)}
			</Container>
		</Container>
	);
};

export const ContactsPage = memo(ContactsPageComponent);
ContactsPage.displayName = 'ContactsPage';
