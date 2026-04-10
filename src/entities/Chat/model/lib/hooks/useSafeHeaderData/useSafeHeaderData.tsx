import { useMemo } from 'react';
import {
	UseSafeHeaderDataOptions,
	SafeHeaderData
} from '../../../types/chat.types/chat.types';
import { getPreviewData } from '../../utils/getPreviewData/getPreviewData';

export const useSafeHeaderData = ({
	chatUid,
	headerData,
	chatData,
	userDataFromSearch
}: UseSafeHeaderDataOptions): SafeHeaderData => {
	return useMemo(() => {
		const preview = chatUid ? getPreviewData(chatUid) : {};

		return {
			userName:
				userDataFromSearch?.userName ??
				preview.userName ??
				headerData?.userName ??
				'Неизвестный пользователь',

			userStatus: headerData?.userStatus ?? 'был(а) давно',

			userAvatar:
				userDataFromSearch?.avatar ?? preview.avatar ?? headerData?.userAvatar,

			isOnline:
				userDataFromSearch?.isOnline ??
				preview.isOnline ??
				headerData?.isOnline ??
				false,

			isInContacts: headerData?.isInContacts ?? false,

			contactPhone: chatData?.chat?.username?.startsWith('+')
				? chatData.chat.username
				: undefined,

			contactFirstName: chatData?.chat?.first_name,
			contactLastName: chatData?.chat?.last_name
		};
	}, [headerData, chatData, userDataFromSearch, chatUid]);
};
