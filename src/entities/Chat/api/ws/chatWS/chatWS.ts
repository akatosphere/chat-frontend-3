import type { AppDispatch } from '@/app/providers/StoreProvider/config/store';
import { RawApiChatMessage } from '@/entities/Chat';
import {
	MESSAGES_PAGE_SIZE,
	MESSAGES_ORDERING,
	CHATS_PAGE_SIZE,
	CHATS_ORDERING
} from '@/shared/model';
import { chatApi } from '../../chatApi/chatApi';
import { registerWSHandler } from '@/shared/api/WS/services/socketClient/socketClient';
import { WSResponse, WS_ACTIONS, ChangeStatusReadResponse } from '@/shared/api';
import {
	extractUid,
	updateMessagesCache,
	updateChatInList
} from '../../../model/lib/utils/WSUtils/utils';

type WSContext = {
	dispatch: AppDispatch;
	currentUserId: string | null;
};

let wsContext: WSContext | null = null;

export const initChatWS = (dispatch: AppDispatch) => {
	wsContext = { dispatch, currentUserId: null };
};

export const setChatWSCurrentUserId = (userId: string | null) => {
	if (wsContext) {
		wsContext = { ...wsContext, currentUserId: userId };
	}
};

const handleCreateTextMessage = (response: WSResponse) => {
	if (!wsContext || !response.object) {
		return;
	}

	const { dispatch, currentUserId } = wsContext;
	const raw = response.object as RawApiChatMessage;

	const fromUid = extractUid(raw.from_user);
	const toUid = extractUid(raw.to_user);

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

	dispatch(
		chatApi.util.updateQueryData(
			'getMessages',
			{
				user_uid: queryUserUid,
				page_size: MESSAGES_PAGE_SIZE,
				ordering: MESSAGES_ORDERING
			},
			draft => updateMessagesCache(draft, raw, currentUserId)
		)
	);

	dispatch(
		chatApi.util.updateQueryData(
			'getChats',
			{ pageSize: CHATS_PAGE_SIZE, ordering: CHATS_ORDERING },
			draft => updateChatInList(draft, raw, currentUserId)
		)
	);
};

const handleReadStatusChange = (response: WSResponse) => {
	if (!wsContext?.dispatch || !response.object) {
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
		const targetUserUid = extractUid(
			obj.from_user?.uid === wsContext.currentUserId
				? obj.to_user
				: obj.from_user
		);

		const { dispatch } = wsContext;

		if (targetUserUid) {
			dispatch(
				chatApi.util.updateQueryData(
					'getMessages',
					{
						user_uid: targetUserUid,
						page_size: MESSAGES_PAGE_SIZE,
						ordering: MESSAGES_ORDERING
					},
					draft => {
						if (!draft?.results) {
							return;
						}
						const msg = draft.results.find(
							m => m.uid === uid || (obj.id && m.id === obj.id)
						);
						if (msg) {
							msg.new = serverNewValue;
						}
					}
				)
			);
		}

		dispatch(
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

		queueMicrotask(() => {
			dispatch(chatApi.util.invalidateTags([{ type: 'Messages', id: 'LIST' }]));
		});
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
