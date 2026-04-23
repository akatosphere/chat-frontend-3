import { MessagesList } from '@/entities/Chat';

interface PageProps {
	params: {
		uid: string;
		chatKey: string;
	};
}

export default function Page({ params }: PageProps) {
	return <MessagesList userUid={params.uid} chatKey={params.chatKey} />;
}
