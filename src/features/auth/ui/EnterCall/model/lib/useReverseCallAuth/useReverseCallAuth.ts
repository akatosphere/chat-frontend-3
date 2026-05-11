import { useState, useCallback, useRef, useEffect } from 'react';

export const useReverseCallAuth = (
	sessionUid: string,
	sessionSecret: string,
	proxyPrefix = '/api/proxy'
) => {
	const [status, setStatus] = useState<'pending' | 'verified' | 'error'>(
		'pending'
	);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const pollRef = useRef<() => void>(null);

	const claimTokens = useCallback(async () => {
		const res = await fetch(
			`${proxyPrefix}/auth/providers/plusofon/flash-call/claim/${sessionUid}/`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ session_secret: sessionSecret }),
				credentials: 'include'
			}
		);
		if (!res.ok) {
			const err = await res.text();
			throw new Error(`Claim failed: ${res.status} ${err}`);
		}
		return res.json();
	}, [sessionUid, sessionSecret, proxyPrefix]);

	const stopPolling = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const runPoll = useCallback(
		async (
			onSuccess: (tokens: {
				access: string;
				refresh: string;
				is_filled: boolean;
			}) => void
		) => {
			try {
				const res = await fetch(
					`${proxyPrefix}/auth/providers/plusofon/flash-call/status/${sessionUid}/`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ session_secret: sessionSecret }),
						credentials: 'include'
					}
				);
				if (!res.ok) {
					throw new Error(`Status failed: ${res.status}`);
				}

				const data = await res.json();

				if (data.status === 'verified' && data.is_claim_available) {
					setStatus('verified');
					stopPolling();
					const tokens = await claimTokens();
					onSuccess(tokens);
					return;
				}

				if (data.status === 'pending') {
					const interval = (data.poll_interval_seconds || 2) * 1000;
					timerRef.current = setTimeout(() => pollRef.current?.(), interval);
				}
			} catch (e) {
				setStatus('error');
				throw e;
			}
		},
		[sessionUid, sessionSecret, claimTokens, proxyPrefix, stopPolling]
	);

	useEffect(() => {
		pollRef.current = () => runPoll;
	}, [runPoll]);

	const pollStatus = useCallback(
		(
			onSuccess: (tokens: {
				access: string;
				refresh: string;
				is_filled: boolean;
			}) => void
		) => {
			runPoll(onSuccess);
		},
		[runPoll]
	);

	useEffect(() => {
		return () => stopPolling();
	}, [stopPolling]);

	return { status, pollStatus, stopPolling };
};
