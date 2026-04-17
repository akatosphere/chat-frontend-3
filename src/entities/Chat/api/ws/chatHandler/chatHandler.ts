import { mapApiMessageToFrontend } from '@/entities/Chat/model/mapper/mapChatType/chatMapper';
import type { AppDispatch } from '@/app/providers/StoreProvider/config/store';
import { MessageStatus, RawApiChatMessage } from '@/entities/Chat';
import {
	MESSAGES_PAGE_SIZE,
	MESSAGES_ORDERING,
	CHATS_PAGE_SIZE,
	CHATS_ORDERING
} from '@/shared/model';
import { chatApi } from '../../chatApi/chatApi';
import { registerWSHandler } from '@/shared/api/WS/services/socketClient/socketClient';
import { WSResponse, WS_ACTIONS, ChangeStatusReadResponse } from '@/shared/api';

let wsDispatch: AppDispatch | null = null;
let currentUserId: string | null = null;

export const initChatWS = (dispatch: AppDispatch) => {
	wsDispatch = dispatch;
};

export const setChatWSCurrentUserId = (userId: string | null) => {
	currentUserId = userId;
};

const handleCreateTextMessage = (response: WSResponse) => {
	if (!response.object || !wsDispatch) {
		return;
	}

	const raw = response.object as RawApiChatMessage;
	const fromUid =
		typeof raw.from_user === 'string' ? raw.from_user : raw.from_user?.uid;
	const toUid =
		typeof raw.to_user === 'string' ? raw.to_user : raw.to_user?.uid;

	let queryUserUid: string | undefined;
	if (raw.chat_type === 'chat' || !raw.chat_key) {
		queryUserUid =
			toUid && toUid !== currentUserId
				? toUid
				: fromUid && fromUid !== currentUserId
					? fromUid
					: undefined;
	} else {
		queryUserUid = raw.chat_key;
	}
	if (!queryUserUid || !raw.uid) {
		return;
	}

	const mapped = mapApiMessageToFrontend(raw);

	wsDispatch(
		chatApi.util.updateQueryData(
			'getMessages',
			{
				user_uid: queryUserUid,
				page_size: MESSAGES_PAGE_SIZE,
				ordering: MESSAGES_ORDERING
			},
			draft => {
				if (!draft?.results) {
					return;
				}
				if (!draft.results.some(m => m.uid === mapped.uid)) {
					draft.results.unshift(mapped);
				}
			}
		)
	);

	wsDispatch(
		chatApi.util.updateQueryData(
			'getChats',
			{ pageSize: CHATS_PAGE_SIZE, ordering: CHATS_ORDERING },
			draft => {
				if (!draft?.results) {
					return;
				}
				const chat = draft.results.find(
					c => c.chat_key === raw.chat_key || c.chat.uid === queryUserUid
				);
				if (chat) {
					const isSentByMe = currentUserId && fromUid === currentUserId;
					chat.last_message = {
						id: raw.id,
						uid: raw.uid,
						from_user: fromUid,
						content: raw.content,
						files_summary: raw.files_list?.length
							? {
									types: raw.files_list
										.map(f => f.file_type)
										.filter((t): t is string => typeof t === 'string')
										.slice(0, 3),
									count: raw.files_list.length
								}
							: { types: [], count: 0 },
						has_replied_message: raw.replied_messages?.length > 0,
						has_forwarded_message: raw.forwarded_messages?.length > 0,
						new: !isSentByMe && raw.new,
						created_at: new Date(raw.created_at).getTime(),
						updated_at: new Date(raw.updated_at).getTime(),
						status: isSentByMe ? MessageStatus.READ : MessageStatus.RECEIVED
					};
					if (!isSentByMe && raw.new) {
						chat.new_message_count = (chat.new_message_count || 0) + 1;
					}
					chat.last_activity_at = new Date(raw.created_at).getTime();
				}
			}
		)
	);
};

const handleReadStatusChange = (response: WSResponse) => {
	if (!response.object || !wsDispatch) {
		return;
	}

	if (
		response.action === WS_ACTIONS.CHANGE_STATUS_READ_MESSAGE &&
		response.status === 'OK'
	) {
		const obj = response.object as ChangeStatusReadResponse;
		const uid = obj?.uid;
		if (!uid) {
			return;
		}

		const serverNewValue = obj.new ?? false;
		const chatKey = obj.chat_data?.chat_key;
		const targetUserUid =
			obj.from_user?.uid === currentUserId
				? obj.to_user?.uid
				: obj.from_user?.uid;

		if (targetUserUid && wsDispatch) {
			const queryArgs = {
				user_uid: targetUserUid,
				page_size: MESSAGES_PAGE_SIZE,
				ordering: MESSAGES_ORDERING
			};
			wsDispatch(
				chatApi.util.updateQueryData('getMessages', queryArgs, draft => {
					if (!draft?.results) {
						return;
					}
					const msg = draft.results.find(
						m => m.uid === uid || (obj.id && m.id === obj.id)
					);
					if (msg) {
						Object.assign(msg, { ...msg, new: serverNewValue });
					}
				})
			);
		}

		if (wsDispatch) {
			wsDispatch(
				chatApi.util.updateQueryData(
					'getChats',
					{ pageSize: CHATS_PAGE_SIZE, ordering: CHATS_ORDERING },
					draft => {
						if (!draft?.results) {
							return;
						}
						const chat = draft.results.find(c => c.chat_key === chatKey);
						if (chat?.last_message?.uid === uid) {
							chat.last_message = { ...chat.last_message, new: serverNewValue };
						}
					}
				)
			);
		}

		if (wsDispatch) {
			setTimeout(() => {
				wsDispatch?.(
					chatApi.util.invalidateTags([{ type: 'Messages', id: 'LIST' }])
				);
			}, 50);
		}
	}
};

export const registerChatWSHandlers = (): (() => void) => {
	const unsub1 = registerWSHandler(
		WS_ACTIONS.CREATE_TEXT_MESSAGE,
		handleCreateTextMessage
	);
	const unsub2 = registerWSHandler(
		WS_ACTIONS.CHANGE_STATUS_READ_MESSAGE,
		handleReadStatusChange
	);
	return () => {
		unsub1();
		unsub2();
	};
};
