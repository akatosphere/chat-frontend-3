import { authActions } from '@/features/auth/model/slices/authSlice';
import { rtkApi } from '@/shared/api/rtkApi';
import {
	ClaimRequest,
	ClaimResponse,
	RegisterResponse,
	StartRequest,
	StartResponseErr,
	StartResponseOk,
	StatusRequest,
	StatusResponse
} from '../model/types/auth.types';

export const authApi = rtkApi.injectEndpoints({
	endpoints: builder => ({
		startPlusofon: builder.mutation<
			StartResponseOk | StartResponseErr,
			StartRequest
		>({
			query: (data: StartRequest) => ({
				url: '/auth/providers/plusofon/flash-call/start/',
				method: 'POST',
				body: data
			}),
			async onQueryStarted(arg, { dispatch, queryFulfilled }) {
				dispatch(authActions.setPhoneData({ phone_number: arg.phone_number }));

				try {
					const { data } = await queryFulfilled;

					if ('session_uid' in data) {
						dispatch(
							authActions.setPhoneSession({
								session_uid: data.session_uid,
								session_secret: data.session_secret,
								call_number: data.call_number,
								expires_at: data.expires_at,
								poll_interval_seconds: data.poll_interval_seconds,
								attempt_number: data.attempt_number
							})
						);
					} else {
						const err = data as StartResponseErr;
						dispatch(
							authActions.setPhoneSession({
								blocked_until: err.blocked_until,
								attempt_number: err.attempt_number,
								block_duration_seconds: err.block_duration_seconds,
								block_created_at: err.block_created_at
							})
						);
					}
				} catch (error) {
					dispatch(authActions.clearPhoneData());
				}
			}
		}),

		checkPlusofonStatus: builder.mutation<
			StatusResponse,
			{ session_uid: string } & StatusRequest
		>({
			query: ({ session_uid, session_secret }) => ({
				url: `/auth/providers/plusofon/flash-call/status/${session_uid}/`,
				method: 'POST',
				body: { session_secret }
			})
		}),

		claimPlusofonToken: builder.mutation<
			ClaimResponse,
			{ session_uid: string } & ClaimRequest
		>({
			query: ({ session_uid, session_secret }) => ({
				url: `/auth/providers/plusofon/flash-call/claim/${session_uid}/`,
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
	}),
	overrideExisting: process.env.NODE_ENV === 'development'
});

export const {
	useStartPlusofonMutation,
	useCheckPlusofonStatusMutation,
	useClaimPlusofonTokenMutation,
	useSendNicknameMutation
} = authApi;
