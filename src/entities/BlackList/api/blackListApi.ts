import { rtkApi } from '@/shared/api/rtkApi';
import {
	BlackListResponse,
	BlackListUser
} from '../model/types/BlackListSchema';

const blackListApi = rtkApi.injectEndpoints({
	endpoints: build => ({
		getBlackList: build.query<BlackListUser[], void>({
			query: () => ({
				url: '/contact/blacklist/'
			}),
			transformResponse: (response: BlackListResponse) => {
				return response.results.map(item => item.blocked_user);
			},
			providesTags: ['BlackList']
		}),
		addBlackList: build.mutation<void, string>({
			query: uid => ({
				url: `/contact/blacklist/add/${uid}/`,
				method: 'POST'
			}),
			invalidatesTags: ['BlackList', { type: 'Chats', id: 'LIST' }]
		}),
		deleteBlackList: build.mutation<void, string>({
			query: uid => ({
				url: `/contact/blacklist/delete/${uid}/`,
				method: 'DELETE'
			}),
			invalidatesTags: ['BlackList', { type: 'Chats', id: 'LIST' }]
		})
	})
});

export const {
	useGetBlackListQuery,
	useAddBlackListMutation,
	useDeleteBlackListMutation
} = blackListApi;
