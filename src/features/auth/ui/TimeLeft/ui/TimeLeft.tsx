'use client';
import { formatTime } from '@/shared/lib/formatTime/formatTime';
import { useEffect, useState } from 'react';
import { authActions } from '@/features/auth';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch/useAppDispatch';
import styles from './TimeLeft.module.scss';

interface TimeLeftProps {
	initialTime: number;
	setFinishedTime: (arg: boolean) => void;
}

export function TimeLeft({ initialTime, setFinishedTime }: TimeLeftProps) {
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const dispatch = useAppDispatch();

	useEffect(() => {
		setTimeLeft(initialTime);
	}, [initialTime]);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(prev => Math.max(prev - 1, 0));
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (timeLeft === 0) {
			setFinishedTime(true);
			dispatch(authActions.setBlockingTime(0));
		}
	}, [timeLeft, setFinishedTime, dispatch]);

	return <span className={styles.timeLeft}>{formatTime(timeLeft)}</span>;
}
