'use client';

import { useEffect, useState } from 'react';
import { useReverseCallAuth } from '../../model/lib/useReverseCallAuth/useReverseCallAuth';
import { formatPhone } from '@/shared/lib/formatPhone/formatPhone';
import { Button, ButtonColor } from '@/shared/ui/Button';
import {
	Text,
	TextAlign,
	FontWeight,
	TextColor,
	TextSize
} from '@/shared/ui/Text';
import cls from './ReverseCallAuth.module.scss';

interface Props {
	sessionUid: string;
	sessionSecret: string;
	callNumber: string;
	phoneNumber: string;
	onAuthSuccess: (tokens: {
		access: string;
		refresh: string;
		is_filled: boolean;
	}) => void;
	onAuthError: (error: Error) => void;
}

export const ReverseCallAuth = ({
	sessionUid,
	sessionSecret,
	callNumber,
	phoneNumber,
	onAuthSuccess
}: Props) => {
	const [isPollingStarted, setIsPollingStarted] = useState(false);
	const { status, pollStatus, stopPolling } = useReverseCallAuth(
		sessionUid,
		sessionSecret
	);

	const handleCall = () => {
		const normalized = callNumber.replace(/[^\d+]/g, '');
		const tel = normalized.startsWith('+') ? normalized : `+${normalized}`;
		window.location.href = `tel:${tel}`;

		if (!isPollingStarted) {
			setIsPollingStarted(true);

			pollStatus(onAuthSuccess);
		}
	};

	useEffect(() => {
		return () => stopPolling();
	}, [stopPolling]);

	return (
		<div className={cls.loginCode}>
			<Text textAlign={TextAlign.CENTER} fontSize={TextSize.L}>
				Позвоните на номер (бесплатно):
			</Text>

			<div className={cls.phoneBlock}>
				<a
					href={`tel:${callNumber.replace(/[^\d+]/g, '')}`}
					className={cls.callNumber}
					onClick={e => {
						e.preventDefault();
						handleCall();
					}}
				>
					{formatPhone(callNumber)}
				</a>

				<Text
					textAlign={TextAlign.CENTER}
					fontWeight={FontWeight.MEDIUM}
					color={TextColor.VIOLET}
					fontSize={TextSize.L}
				>
					Ваш номер - {formatPhone(phoneNumber)}
				</Text>
			</div>
			{!isPollingStarted ? (
				<Button
					onClick={handleCall}
					color={ButtonColor.PRIMARY}
					className={cls.btn}
				>
					Я позвонил
				</Button>
			) : status === 'verified' ? (
				<Text textAlign={TextAlign.CENTER} color={TextColor.ACCENT}>
					✅ Подтверждено, входим...
				</Text>
			) : status === 'error' ? (
				<Text textAlign={TextAlign.CENTER} color={TextColor.ERROR}>
					❌ Ошибка подтверждения
				</Text>
			) : (
				<Text textAlign={TextAlign.CENTER} color={TextColor.GRAY}>
					⏳ Ожидаем подтверждения...
				</Text>
			)}
		</div>
	);
};
