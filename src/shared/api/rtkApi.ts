import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from './baseQuery';

export const rtkApi = createApi({
	reducerPath: 'rtkApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: [
		'Support',
		'sendPhone',
		'EditProfile',
		'Profile',
		'Chats',
		'Messages',
		'Contacts',
		'Contact',
		'ChatList',
		'GlobalContactSearch'
	],
	endpoints: _ => ({})
});
