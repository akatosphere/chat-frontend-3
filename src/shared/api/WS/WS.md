# WebSocket сервис для чата

Сервис реализует единое WebSocket‑соединение для фронтенда, авторизацию через `accessToken` в query‑параметре, запрос–ответ по `request_uid` и подписки на события по `action`.

# Глобальные переменные сервиса

1. let socket: WebSocket | null = null
   Назначение: Единственное WebSocket-соединение на всё приложение.

2. const subscribers = new Map<string, Set<(data: WSResponse) => void>>()
   Назначение: Система подписок на события по action.

Map<action: string, Set<callback: (data: WSResponse) => void>>

Пример:
subscribers = {
'create_text_message': Set([cb1, cb2]),
'add_members_to_chat': Set([cb3])
}

Роль:

Позволяет многим компонентам подписаться на одно событие.

Set гарантирует отсутствие дубликатов callback'ов.

Callback вызывается, когда приходит WS‑сообщение с response.action === key.

# const pendingRequests = new Map<string, (response: WSResponse) => void>()

Назначение: "Журнал ожидающих ответов" для sendWS (request/response).

Структура:

Map<request_uid: string, resolve: (response: WSResponse) => void>
Пример:
pendingRequests = {
'uuid-123': resolve1, // resolve из первого sendWS
'uuid-456': resolve2 // resolve из второго sendWS
}
Роль:

Превращает WebSocket в HTTP‑подобный API: один запрос → один ответ.

По response.request_uid находит соответствующий resolve промиса.

После вызова resolve(response) запись удаляется (delete).

Жизненный цикл записи:

1. sendWS() → pendingRequests.set(uuid, resolve)
2. Сервер отвечает → pendingRequests.get(uuid) → resolve(response)
3. pendingRequests.delete(uuid) → запись исчезает

# let tokenExpiry = 0

Назначение: Timestamp истечения кешированного токена.

Роль:

Определяет, просрочен ли currentToken.

Вычисляется как Date.now() + 9 _ 60 _ 1000 (9 минут).

Сравнивается с Date.now() в ensureFreshToken().

# Экспортируемые функции

# subscribeWS<T = WSResponse>(action: string, callback: (data: T) => void): () => void

Подписка на поток входящих сообщений по конкретному action.

- При первом вызове для action создаётся множество подписчиков.

- Каждый входящий WS‑пакет с совпадающим response.action будет передан во все callbacks, если это не ответ на sendWS (см. pendingRequests).

- Возвращает функцию unsubscribe, которую нужно вызвать при размонтировании / завершении использования.

Пример:

useEffect(() => {
const unsubscribe = subscribeWS('create_text_message', res => {
console.log('Новое сообщение:', res.object);
});

return unsubscribe;
}, []);

# sendWS<T = WSResponse>(request: WSRequest): Promise<T>

Отправка команды на сервер с ожиданием ответа по request_uid.

- Гарантирует наличие открытого сокета (через setupSocket).

- Генерирует уникальный request_uid и дописывает его в request.

- Сохраняет resolve промиса в pendingRequests под ключом request_uid.

- Отправляет запрос через WebSocket.

- Ждёт ответ:
  - когда придёт WS‑сообщение с тем же request_uid, resolve будет вызван в onmessage;

  - если ответа нет в течение 10 секунд, промис отклоняется с ошибкой таймаута.

Пример:

const res = await sendWS({
action: 'create_text_message',
object: { chat_key: 'chat1', text: 'Привет' },
});
// res.status === 'OK' | 'error'

# disconnectWS(): void

Принудительное закрытие соединения и очистка состояния.

- Закрывает WebSocket.

- Обнуляет socket и currentToken.

- Очищает subscribers и pendingRequests.

Использовать, например, при logout или жёстком сбросе приложения.

disconnectWS();

# Хелперы для действий чата

Это тонкие обёртки над sendWS с готовыми action и object.

connectChat(): Promise<WSResponse>
Подключение к чату / инициализация WS‑сессии.

ts
await connectChat();
createTextMessage(chatKey: string, text: string): Promise<WSResponse>
Создание текстового сообщения в чате.

ts
await createTextMessage('chat1', 'Привет!');
addMembersToChat(chatKey: string, uids: string[]): Promise<WSResponse>
Добавление участников в чат / группу.

ts
await addMembersToChat('chat1', ['uid1', 'uid2']);

# Токен и его обновление

ts
let currentToken: string | null = null;
let tokenExpiry = 0;
getAccessToken(): Promise<string | null>
Делает GET /api/auth/getAccessToken без кеша.

Возвращает accessToken или null при ошибке.

ensureFreshToken(): Promise<string>
Если currentToken не просрочен — возвращает его.

Иначе запрашивает новый токен, сохраняет в currentToken, выставляет tokenExpiry = now + 9 минут.

При отсутствии токена кидает Error('No token').

# Обработка входящих сообщений

ts
const subscribers = new Map<string, Set<(data: WSResponse) => void>>();
const pendingRequests = new Map<string, (response: WSResponse) => void>();
В socket.onmessage:

1. Парсится event.data в WSResponse.

2. Сначала ищется pendingRequests.get(response.request_uid):

если найден:

- вызывается сохранённый resolve(response);

- запись удаляется из pendingRequests;

- обработка на этом заканчивается (return), до подписчиков по action дело не доходит.

3. Если pendingRequests записи не содержит:

- ищутся подписчики subscribers.get(response.action);

- каждый callback вызывается с response.

Таким образом:

sendWS использует pendingRequests для одиночных ответов на конкретный запрос.

subscribeWS же получает все прочие события по заданному action (включая broadcast‑события от сервера).

┌─────────────────┐
│ TokenManager │ ← Единый источник истины для токенов
│ (singleton) │
├─────────────────┤
│ • Хранит access token и время его жизни
│ • Автоматически обновляет токен за 1 мин до истечения
│ • Останавливает цикл при 401 (токен истёк)
│ • Уведомляет подписчиков при смене токена
│ • Безопасно очищается при логауте
└─────────────────┘

┌─────────────────┐
│ WebSocket │ ← Управление соединением
│ (socketClient) │
├─────────────────┤
│ • Подписывается на TokenManager
│ • При смене токена — мягкий реконнект (без разрыва для пользователя)
│ • Повторяет неотправленные запросы после реконнекта
│ • Обрабатывает 401: пытается рефреш → если не вышло → логаут
└─────────────────┘

┌─────────────────┐
│ StoreProvider │ ← Точка входа
├─────────────────┤
│ • Инициализирует TokenManager при старте
│ • Подключает WebSocket только если есть валидный токен
│ • Чистит всё при размонтировании или логауте
└─────────────────┘

┌─────────────────┐
│ useLogout │ ← Единая точка выхода
├─────────────────┤
• Отзывает сессию на сервере
• Отключает WebSocket
• Очищает TokenManager
• Сбрасывает Redux и persisted state
• Редиректит на /login
└─────────────────┘

1. Пользователь вошёл → TokenManager получил access + refresh токены
   ↓
2. Запланирован таймер: "обновить за 60 сек до истечения" (~9 мин)
   ↓
3. Через 9 мин: TokenManager делает POST /api/auth/refresh
   ↓
4. Прокси/бэкенд проверяет refresh token → выдаёт новый access
   ↓
5. TokenManager:
   • Сохраняет новый токен
   • Обновляет время истечения
   • Уведомляет подписчиков (WebSocket)
   ↓
6. WebSocket получает уведомление → мягкий реконнект с новым токеном
   ↓
7. Пользователь продолжает работать — ничего не заметил

## Чеклист для нового разработчика

[ ] Понимаю: токен обновляется автоматически, мне не нужно об этом думать
[ ] Понимаю: при логауте вызываю useLogout() — всё очистится само
[ ] Понимаю: если вижу 401 — это значит, что сессия истекла, нужно перелогиниться
[ ] Понимаю: не храню токены в localStorage, не передаю их в пропсах
[ ] Понимаю: если добавляю новый эндпоинт авторизации — обновляю AuthResponse тип
