import { MessagesList } from '@/entities/Chat';

interface PageProps {
	params: {
		uid: string;
	};
}

export default function Page({ params }: PageProps) {
	// 🔹 Извлекаем uid из params и передаём как chatUid (не userUid!)
	return <MessagesList userUid={params.uid} />;
}
