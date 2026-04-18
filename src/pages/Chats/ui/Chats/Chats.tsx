'use client';

import { memo, useState } from 'react';
import { ChatList, ChatView } from '@/entities/Chat';
import { Container, ContainerType } from '@/shared/ui/Container';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import { Text } from '@/shared/ui/Text';

import cls from './Chats.module.scss';
import { ChatProfileView } from '@/entities/Chat/ui/ChatProfileView/ChatProfileView';

const ChatsPageComponent = () => {
	const params = useParams();
	const router = useRouter();

	// Получаем uid из динамического сегмента [uid]
	const chatUid = params?.uid as string | undefined;

	const isMobile = useMediaQuery();

	const [profileShown, setProfileShown] = useState(false);

	const toggleProfile = () => {
		setProfileShown(prev => !prev);
	};

	// МОБИЛЬНАЯ ЛОГИКА: показываем только один экран
	if (isMobile) {
		return (
			<Container type={ContainerType.WRAPPER}>
				{chatUid ? (
					// Если чат выбран → показываем сообщения (CONTENT)
					<Container type={ContainerType.CONTENT}>
						<ChatView
							chatUid={chatUid}
							onBack={() => router.push('/chats')}
							onOpenProfile={toggleProfile}
						/>
					</Container>
				) : (
					// Если чат не выбран → показываем список чатов (SIDEBAR)
					<Container type={ContainerType.SIDEBAR}>
						<ChatList selectedChatUid={null} />
					</Container>
				)}
			</Container>
		);
	}

	//  ДЕСКТОПНАЯ ЛОГИКА: показываем оба контейнера
	return (
		<Container type={ContainerType.WRAPPER}>
			<Container type={ContainerType.SIDEBAR}>
				<ChatList selectedChatUid={chatUid ?? null} />
			</Container>

			<Container type={ContainerType.CONTENT}>
				{chatUid ? (
					<ChatView chatUid={chatUid} onOpenProfile={toggleProfile} />
				) : (
					<div className={cls.emptyState}>
						<Text>Выберите чат для начала общения</Text>
					</div>
				)}
			</Container>

			{profileShown && chatUid && (
				<Container type={ContainerType.CONTENT}>
					<ChatProfileView userUid={chatUid} />
				</Container>
			)}
		</Container>
	);
};

export const ChatsPage = memo(ChatsPageComponent);
ChatsPage.displayName = 'ChatsPage';
