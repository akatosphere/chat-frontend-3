import { MessagesList } from '@/entities/Chat';

interface PageProps {
	params: {
		uid: string;
	};
}

export default function Page({ params }: PageProps) {
	return <MessagesList userUid={params.uid} />;
}
