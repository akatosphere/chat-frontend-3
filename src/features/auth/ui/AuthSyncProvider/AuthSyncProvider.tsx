'use client';

import { useEffect } from 'react';
import { useGetProfileQuery } from '@/entities/Profile/api/editProfile.api';
import { authActions } from '@/features/auth/model/slices/authSlice';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { logger } from '@/shared/lib/logger/logger';
interface AuthSyncProviderProps {
	children: React.ReactNode;
}

export const AuthSyncProvider = ({ children }: AuthSyncProviderProps) => {
	const dispatch = useAppDispatch();

	const { data: profileData } = useGetProfileQuery(undefined);

	useEffect(() => {
		const uid = profileData?.uid;

		if (uid) {
			dispatch(authActions.setCurrentUserId(uid));

			import('@/shared/api').then(({ setWSCurrentUserId, setupSocket }) => {
				setWSCurrentUserId(uid);
				setupSocket().catch(err => logger.error('WS init error:', err));
			});
		}
	}, [profileData?.uid, dispatch]);
	return <>{children}</>;
};
