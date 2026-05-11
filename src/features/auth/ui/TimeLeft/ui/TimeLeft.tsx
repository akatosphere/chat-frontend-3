'use client';

import { formatTime } from '@/shared/lib/formatTime/formatTime';
import { useEffect, useState } from 'react';
import styles from './TimeLeft.module.scss';

interface TimeLeftProps {
	initialTime: number;
	setFinishedTime: (arg: boolean) => void;
}

export function TimeLeft({ initialTime, setFinishedTime }: TimeLeftProps) {
	const [timeLeft, setTimeLeft] = useState(initialTime);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					setFinishedTime(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [setFinishedTime]);

	if (timeLeft <= 0) {
		return <span className={styles.timeLeft}>00:00</span>;
	}

	return <span className={styles.timeLeft}>{formatTime(timeLeft)}</span>;
}
