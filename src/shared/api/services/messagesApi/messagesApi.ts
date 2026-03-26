import { rtkApi } from '@/shared/api/rtkApi';

export interface MessageApi {
	uid: string;
	content: string;
	from_me: boolean;
	created_at: string;
	updated_at: string;
	new: boolean;
}

interface GetMessagesResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: MessageApi[];
}

export const messagesApi = rtkApi.injectEndpoints({
	endpoints: builder => ({
		getMessages: builder.query<GetMessagesResponse, { userUid: string }>({
			query: ({ userUid }) => ({
				url: `/chat/message/text/${userUid}/`,
				method: 'GET',
				params: {
					page_size: 50
				}
			}),
			providesTags: ['Messages']
		})
	}),
	overrideExisting: false
});

export const { useGetMessagesQuery } = messagesApi;
