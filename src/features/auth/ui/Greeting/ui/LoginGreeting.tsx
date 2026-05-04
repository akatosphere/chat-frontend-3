'use client';

import { Button } from '@/shared/ui/Button';
import {
	FontWeight,
	Text,
	TextAlign,
	TextColor,
	TextSize,
	TextTag,
	TextType,
	TitleTag
} from '@/shared/ui/Text';
import { Logo } from '@icons/index';
import { useSetAuthStep } from '@/features/auth';
import { useRef, useEffect } from 'react';

import styles from './LoginGreeting.module.scss';

export const LoginGreeting = () => {
	const setStep = useSetAuthStep();

	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		buttonRef.current?.focus();
	}, []);

	return (
		<>
			<Logo className={styles.logo} />
			<Text
				type={TextType.TITLE}
				tag={TitleTag.H1}
				fontWeight={FontWeight.SEMI_BOLD}
				textAlign={TextAlign.CENTER}
				className={styles.title}
			>
				А-Чат
			</Text>
			<Text
				type={TextType.TEXT}
				tag={TextTag.P}
				fontSize={TextSize.L}
				fontWeight={FontWeight.REGULAR}
				textAlign={TextAlign.CENTER}
				color={TextColor.VIOLET}
				className={styles.text}
			>
				Привет!
			</Text>
			<Text
				type={TextType.TEXT}
				tag={TextTag.P}
				fontSize={TextSize.L}
				fontWeight={FontWeight.REGULAR}
				textAlign={TextAlign.CENTER}
				color={TextColor.VIOLET}
				className={styles.text}
			>
				Давай знакомиться
			</Text>
			<Button
				onClick={() => setStep('phone')}
				btnRef={buttonRef}
				className={styles.btn}
			>
				Начать
			</Button>
		</>
	);
};
