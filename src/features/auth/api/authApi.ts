import { authActions } from '@/features/auth/model/slices/authSlice';
import { rtkApi } from '@/shared/api/rtkApi';
import {
	RegisterResponse,
	StartRequest,
	StartResponseErr,
	StartResponseOk,
	StatusRequest,
	StatusResponse
} from '../model/types/auth.types';

export const authApi = rtkApi.injectEndpoints({
	endpoints: builder => ({
		sendPhone: builder.mutation<
			StartResponseOk | StartResponseErr,
			StartRequest
		>({
			query: data => ({
				url: `/auth/providers/plusofon/flash-call/start/`,
				method: 'POST',
				body: data
			}),
			invalidatesTags: ['sendPhone'],
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				//  optimistic update — СРАЗУ кладём в store
				dispatch(
					authActions.setPhoneData({
						phone_number: arg.phone_number
					})
				);

				try {
					const { data } = await queryFulfilled;

					if ('session_uid' in data) {
						dispatch(
							authActions.setPhoneSession({
								session_uid: data.session_uid,
								session_secret: data.session_secret,
								call_number: data.call_number,
								expires_at: data.expires_at,
								poll_interval_seconds: data.poll_interval_seconds
							})
						);
					} else {
						const err = data as StartResponseErr;
						// Ошибка → сохраняем поля ошибки
						dispatch(
							authActions.setPhoneSession({
								blocked_until: err.blocked_until,
								attempt_number: err.attempt_number,
								block_duration_seconds: err.block_duration_seconds,
								block_created_at: err.block_created_at
							})
						);
					}
				} catch {
					dispatch(authActions.clearPhoneData());
				}
			}
		}),

		checkStatus: builder.mutation<
			StatusResponse,
			{ session_uid: string } & StatusRequest
		>({
			query: ({ session_uid, session_secret }) => ({
				url: `/auth/providers/plusofon/flash-call/status/${session_uid}/`,
				method: 'POST',
				body: { session_secret }
			})
		}),

		sendNickname: builder.mutation<RegisterResponse, string>({
			query: (nickname: string) => ({
				url: `/${process.env.NEXT_PUBLIC_REGISTER}/${encodeURIComponent(nickname)}/`,
				method: 'GET'
			})
		})
	})
});

export const {
	useSendPhoneMutation,
	useCheckStatusMutation,
	useSendNicknameMutation
} = authApi;
