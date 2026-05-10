import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import {
	ReverseCallAuth,
	EnterPhoneForm,
	LoginGreeting,
	Register,
	FinishRegister,
	SupportSuccess,
	useAuthStep,
	authActions
} from '@/features/auth';
import { SupportForm } from '@/features/support';
import { LoginWrapper } from '@/shared/ui/LoginWrapper';
import { logger } from '@/shared/lib/logger/logger';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import { tokenManager } from '@/shared/lib/tokenManager/tokenManager';

interface AuthTokens {
	access: string;
	refresh: string;
	is_filled: boolean;
}

export const AuthFlow = ({
	containerRef
}: {
	containerRef?: React.RefObject<HTMLDivElement | null>;
}) => {
	const step = useAuthStep();
	const router = useRouter();
	const { phone_number, phoneSession } = useAppSelector(s => s.auth);

	const dispatch = useAppDispatch();

	const routerRef = useRef(router);
	useEffect(() => {
		routerRef.current = router;
	}, [router]);

	const handleAuthSuccess = useCallback(
		async (tokens: AuthTokens) => {
			try {
				tokenManager.setTokens(tokens.access, tokens.refresh);

				dispatch(
					authActions.setTokens({
						access: tokens.access,
						refresh: tokens.refresh
					})
				);
				dispatch(authActions.setIsFilled(tokens.is_filled));

				await import('@/shared/api').then(({ initWSHandlers, setupSocket }) => {
					initWSHandlers(dispatch);
					setupSocket().catch(err => {
						if (
							process.env.NODE_ENV === 'production' ||
							!err.message.includes('WS connection failed')
						) {
							logger.error('WS init error:', err);
						}
					});
				});

				if (tokens.is_filled) {
					routerRef.current.push('/chats');
				} else {
					dispatch(authActions.setStep('register'));
				}
			} catch (err) {
				logger.error(`Auth success handler error:  ${err}`);
				dispatch(authActions.logout());
			}
		},
		[dispatch]
	);

	const handleAuthError = useCallback(
		(err: Error) => logger.error(`Auth error:, ${err}`),
		[]
	);

	switch (step) {
		case 'greeting':
			return <LoginGreeting />;
		case 'phone':
			return (
				<LoginWrapper>
					<EnterPhoneForm containerRef={containerRef} />
				</LoginWrapper>
			);

		case 'reverse_call':
			return (
				<LoginWrapper>
					{phoneSession && (
						<ReverseCallAuth
							sessionUid={phoneSession.session_uid!}
							sessionSecret={phoneSession.session_secret!}
							callNumber={phoneSession.call_number!}
							phoneNumber={phone_number}
							onAuthSuccess={handleAuthSuccess}
							onAuthError={handleAuthError}
						/>
					)}
				</LoginWrapper>
			);

		case 'register':
			return (
				<LoginWrapper>
					<Register />
				</LoginWrapper>
			);
		case 'finish-register':
			return <FinishRegister />;
		case 'support':
			return (
				<LoginWrapper>
					<SupportForm marginTop='0' />
				</LoginWrapper>
			);
		case 'success-support':
			return (
				<LoginWrapper>
					<SupportSuccess />
				</LoginWrapper>
			);
		default:
			return null;
	}
};
