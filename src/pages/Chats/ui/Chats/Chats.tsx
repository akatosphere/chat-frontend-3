'use client';

import { memo, useState } from 'react';
import { ChatList, ChatView } from '@/entities/Chat';
import { Container, ContainerType } from '@/shared/ui/Container';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import { Text } from '@/shared/ui/Text';
import { ChatProfileView } from '@/entities/Chat/ui/ChatProfileView/ChatProfileView';

import cls from './Chats.module.scss';

type MobileView = 'list' | 'chat' | 'profile';

const ChatsPageComponent = () => {
	const params = useParams();
	const router = useRouter();
	const chatUid = params?.uid as string | undefined;
	const isMobile = useMediaQuery();

	const [isProfileOpen, setIsProfileOpen] = useState(false);

	const openProfile = () => setIsProfileOpen(true);
	const closeProfile = () => setIsProfileOpen(false);

	let currentView: MobileView = 'list';
	if (chatUid) {
		currentView = isProfileOpen ? 'profile' : 'chat';
	}

	// МОБИЛЬНАЯ ВЕРСИЯ
	if (isMobile) {
		return (
			<Container type={ContainerType.WRAPPER}>
				{currentView === 'list' && (
					<Container type={ContainerType.SIDEBAR}>
						<ChatList selectedChatUid={null} />
					</Container>
				)}

				{chatUid && (
					<>
						<Container
							type={ContainerType.CONTENT}
							className={currentView !== 'chat' ? cls.hidden : ''}
						>
							<ChatView
								key={`chat-${chatUid}`}
								chatUid={chatUid}
								onBack={() => router.push('/chats')}
								onOpenProfile={openProfile}
							/>
						</Container>

						<Container
							type={ContainerType.CONTENT}
							className={currentView !== 'profile' ? cls.hidden : ''}
						>
							<ChatProfileView userUid={chatUid} onBack={closeProfile} />
						</Container>
					</>
				)}
			</Container>
		);
	}

	// ДЕСКТОПНАЯ ВЕРСИЯ
	return (
		<Container type={ContainerType.WRAPPER}>
			<Container type={ContainerType.SIDEBAR}>
				<ChatList selectedChatUid={chatUid ?? null} />
			</Container>

			<Container type={ContainerType.CONTENT}>
				{chatUid ? (
					<ChatView
						key={`chat-desktop-${chatUid}`}
						chatUid={chatUid}
						onOpenProfile={openProfile}
					/>
				) : (
					<div className={cls.emptyState}>
						<Text>Выберите чат для начала общения</Text>
					</div>
				)}
			</Container>

			{isProfileOpen && chatUid && (
				<Container type={ContainerType.CONTENT}>
					<ChatProfileView userUid={chatUid} onBack={closeProfile} />
				</Container>
			)}
		</Container>
	);
};

export const ChatsPage = memo(ChatsPageComponent);
