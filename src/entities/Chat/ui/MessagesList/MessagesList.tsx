'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { useGetMessagesQuery } from '@/shared/api/services/messagesApi/messagesApi';

import { MessageBubble } from '@/entities/Chat/ui/MessageBubble/MessageBubble';
import { Down } from '@icons/index';

import styles from './MessagesList.module.scss';

// ===== ТИПЫ =====

// тип сообщения (локальный)
interface Message {
	id: string;
	text: string;
	time: number;
	status: 'received' | 'sending' | 'unread' | 'read';
}

// тип сообщения с бэка
interface MessageApi {
	uid: string;
	content: string;
	from_me: boolean;
	created_at: string;
}

// тип ответа с пагинацией (добавлено по ревью)
interface MessagesApiResponse {
	results: MessageApi[];
	next: string | null;
	previous?: string | null;
	count?: number;
}

// пропсы компонента messages
interface MessagesProps {
	userUid: string;
	className: string;
}

// маппинг api -> локальная модель
const mapMessage = (m: MessageApi): Message => ({
	id: m.uid,
	text: m.content,
	time: new Date(m.created_at).getTime(),
	status: m.from_me ? 'read' : 'received'
});

const MessagesListComponent = ({ userUid, className }: MessagesProps) => {
	// ===== ПОЛУЧЕНИЕ ДАННЫХ =====

	// хук для получения сообщений через api
	const { data, error, isLoading, refetch } = useGetMessagesQuery(
		{ userUid },
		{
			// обновление каждые 4 секунды, если есть userUid
			pollingInterval: userUid ? 4000 : 0,
			// пропуск запроса если нет userUid
			skip: !userUid
		}
	);

	// ===== REFS =====

	// реф для контейнера с сообщениями
	const containerRef = useRef<HTMLDivElement>(null);

	// реф для "нижней точки" скролла
	const bottomRef = useRef<HTMLDivElement>(null);

	// реф для отслеживания позиции скролла (без лишних ререндеров)
	const isAtBottomRef = useRef(true);

	// реф для AbortController (добавлено по ревью)
	// нужен чтобы:
	// 1. отменять предыдущие fetch-запросы
	// 2. не обновлять state если компонент размонтирован
	const abortControllerRef = useRef<AbortController | null>(null);

	// ===== STATE =====

	// состояние сообщений
	const [messages, setMessages] = useState<Message[]>([]);

	// ссылка на следующую страницу (pagination с бэка)
	const [nextUrl, setNextUrl] = useState<string | null>(null);

	// флаг загрузки старых сообщений (защита от дублей запросов)
	const [isFetchingMore, setIsFetchingMore] = useState(false);

	// состояние "пользователь внизу"
	const [isAtBottom, setIsAtBottom] = useState(true);

	// количество новых сообщений, когда пользователь не внизу
	const [newCount, setNewCount] = useState(0);

	// ===== ОБРАБОТКА ДАННЫХ С БЭКА =====

	useEffect(() => {
		if (!data) {
			return;
		}

		// маппим данные в локальный формат
		const mapped = data.results.map(mapMessage);

		// сохраняем ссылку на следующую страницу
		setNextUrl(data.next);

		setMessages(prev => {
			// первый рендер просто кладем все сообщения
			if (!prev.length) {
				return mapped;
			}

			// для быстрого сравнения id
			const prevIds = new Set(prev.map(p => p.id));

			// находим реально новые сообщения
			const incoming = mapped.filter(m => !prevIds.has(m.id));

			// если есть новые сообщения
			if (incoming.length) {
				// если пользователь не внизу увеличиваем счетчик
				if (!isAtBottomRef.current) {
					setNewCount(c => c + incoming.length);
				}

				// добавляем новые сообщения в конец
				return [...prev, ...incoming];
			}

			return prev;
		});
	}, [data]);

	// ===== СКРОЛЛ =====

	const handleScroll = () => {
		const el = containerRef.current;
		if (!el) {
			return;
		}

		const threshold = 50; // расстояние до низа

		// проверяем "находимся ли внизу"
		const isBottom =
			el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

		isAtBottomRef.current = isBottom;
		setIsAtBottom(isBottom);

		// если внизу, сбрасываем счетчик новых сообщений
		if (isBottom) {
			setNewCount(0);
		}

		// если пользователь долистал вверх подгружаем старые сообщения
		// добавлен guard чтобы не дергать loadMore слишком часто
		if (el.scrollTop < 50 && !isFetchingMore) {
			loadMore();
		}
	};

	// ===== АВТОСКРОЛЛ ВНИЗ =====

	useEffect(() => {
		// скроллим вниз только если пользователь уже был внизу
		if (isAtBottomRef.current) {
			bottomRef.current?.scrollIntoView({
				behavior: 'smooth'
			});
		}
	}, [messages]);

	// ===== ПОДГРУЗКА СООБЩЕНИЙ (INFINITE SCROLL ВВЕРХ) =====

	const loadMore = async () => {
		// защита:
		// - нет следующей страницы
		// - уже идет загрузка
		if (!nextUrl || isFetchingMore) {
			return;
		}

		// отменяем предыдущий запрос (если пользователь быстро скроллит)
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// создаем новый контроллер
		abortControllerRef.current = new AbortController();

		setIsFetchingMore(true);

		const el = containerRef.current;

		// сохраняем текущую высоту списка
		const prevHeight = el?.scrollHeight;

		try {
			const res = await fetch(nextUrl, {
				// передаем сигнал для возможности отмены
				signal: abortControllerRef.current.signal
			});

			// обработка HTTP ошибок (добавлено по ревью)
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			// типизируем ответ
			const data: MessagesApiResponse = await res.json();

			// маппим старые сообщения
			const older: Message[] = data.results.map(mapMessage);

			// обновляем ссылку на следующую страницу
			setNextUrl(data.next);

			// добавляем старые сообщения в начало
			// защита от дублей (race-condition с polling)
			setMessages(prev => {
				const prevIds = new Set(prev.map(p => p.id));
				const uniqueOlder = older.filter(m => !prevIds.has(m.id));

				return [...uniqueOlder, ...prev];
			});

			// фиксируем позицию скролла
			requestAnimationFrame(() => {
				// prevHeight может быть 0 -> проверяем именно undefined
				if (!el || prevHeight === undefined) {
					return;
				}

				const newHeight = el.scrollHeight;

				// компенсируем разницу высоты
				el.scrollTop = newHeight - prevHeight;
			});
		} catch (error) {
			// игнорируем abort ошибки (это нормальное поведение)
			if (error instanceof DOMException && error.name === 'AbortError') {
				return;
			}

			// теперь ошибка не теряется
			console.error('Failed to load older messages:', error);
		} finally {
			setIsFetchingMore(false);

			// очищаем контроллер
			abortControllerRef.current = null;
		}
	};

	// очистка при размонтировании компонента
	useEffect(() => {
		return () => {
			// отменяем незавершенный запрос
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	// ===== РУЧНОЙ СКРОЛЛ ВНИЗ =====

	const scrollToBottom = () => {
		bottomRef.current?.scrollIntoView({
			behavior: 'smooth'
		});

		setNewCount(0);
	};

	// ===== UI СОСТОЯНИЯ =====

	// состояние загрузки
	if (isLoading) {
		return <div className={styles.emptyState}>Загрузка сообщений...</div>;
	}

	// состояние ошибки
	if (error) {
		return (
			<div className={styles.emptyState}>
				<p>Ошибка загрузки сообщений</p>
				<button onClick={refetch}>Попробовать снова</button>
			</div>
		);
	}

	// ===== ОСНОВНОЙ РЕНДЕР =====

	return (
		<div className={`${styles.wrapper} ${className}`}>
			<div
				ref={containerRef}
				onScroll={handleScroll}
				className={styles.messages}
			>
				{messages.map(m => (
					<MessageBubble
						key={m.id}
						id={m.id}
						text={m.text}
						time={m.time}
						status={m.status}
						onClick={() => {}}
					/>
				))}

				{/* якорь для скролла вниз */}
				<div ref={bottomRef} />
			</div>

			{/* кнопка для скролла вниз, если пользователь не внизу */}
			{!isAtBottom && (
				<button
					className={styles.scrollButton}
					onClick={scrollToBottom}
					// accessibility улучшение (по ревью)
					aria-label='Прокрутить к новым сообщениям'
				>
					<Down />
					{/* показываем количество новых сообщений */}
					{newCount > 0 && <span>({newCount})</span>}
				</button>
			)}
		</div>
	);
};

export const MessagesList = memo(MessagesListComponent);
