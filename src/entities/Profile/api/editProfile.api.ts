import { profileActions, ProfileSchema } from '@/entities/Profile';
import { rtkApi } from '@/shared/api/rtkApi';
import { RawProfileResponse } from '../model/types/ProfileSchema';

export const profileApi = rtkApi.injectEndpoints({
	endpoints: build => ({
		getProfile: build.query<ProfileSchema, void>({
			query: () => ({
				url: `/auth/messenger/profile/`,
				method: 'POST',
				body: {}
			}),
			providesTags: ['Profile'],

			transformResponse: (response: RawProfileResponse): ProfileSchema => {
				return {
					uid: response.uid || response.user?.uid || response.data?.uid,
					username: response.username ?? '',
					first_name: response.first_name ?? '',
					last_name: response.last_name ?? '',
					nickname: response.nickname,
					patronymic: response.patronymic,
					email: response.email,
					phone: response.phone,
					avatar: response.avatar ?? null,
					avatar_url: response.avatar_url ?? null,
					avatar_webp: response.avatar_webp ?? null,
					avatar_webp_url: response.avatar_webp_url ?? null,
					is_filled: response.is_filled ?? false,
					is_staff: response.is_staff ?? false,
					gender: '',
					gender_label: '',
					country: '',
					country_label: '',
					city_id: null,
					city: '',
					error: null,
					isLoading: false
				};
			},

			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;
					dispatch(profileActions.setProfile(data));
				} catch (_) {}
			}
		}),

		//  Редактирование
		editProfile: build.mutation<ProfileSchema, Partial<ProfileSchema>>({
			query: data => ({
				url: `/auth/messenger/profile/`,
				method: 'POST',
				body: data
			}),

			invalidatesTags: ['EditProfile'],

			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				try {
					const { data } = await queryFulfilled;

					dispatch(profileActions.setProfile(data));
				} catch (_) {}
			}
		}),
		deleteProfile: build.mutation({
			query: () => ({
				url: '/auth/messenger/profile/',
				method: 'DELETE'
			}),
			invalidatesTags: ['Profile', 'EditProfile']
		})
	}),
	// Отправка запроса за свежими данными
	overrideExisting: true
});

export const {
	useEditProfileMutation,
	useDeleteProfileMutation,
	useGetProfileQuery
} = profileApi;
