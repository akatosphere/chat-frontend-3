import { useAuthStep } from '@/features/auth';
import { useAuthGoBack } from '@/features/auth/model/lib/hooks/useAuthGoBack';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Button, ButtonTheme } from '@/shared/ui/Button';
import {
	FontWeight,
	Text,
	TextAlign,
	TextType,
	TitleTag
} from '@/shared/ui/Text';
import { Back, Logo } from '@icons/index';
import { ReactNode } from 'react';
import styles from './LoginWrapper.module.scss';

interface LoginWrapperProps {
	children: ReactNode;
}

export function LoginWrapper({ children }: LoginWrapperProps) {
	const goBack = useAuthGoBack();
	const step = useAuthStep();
	let title = '';

	switch (step) {
		case 'phone':
			title = 'Вход/регистрация';
			break;

		case 'code':
			title = 'Подтвердите вход';
			break;

		case 'register':
			title = 'Личная информация';
			break;

		case 'support':
			title = 'Служба поддержки';
			break;
	}

	return (
		<div className={styles.loginWrapper}>
			<Logo className={classNames(styles.logo)} />
			<Button
				theme={ButtonTheme.CLEAR}
				className={styles.btnBack}
				onClick={() => goBack()}
			>
				<Back className={styles.iconBack} />
			</Button>

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
				type={TextType.TITLE}
				tag={TitleTag.H2}
				textAlign={TextAlign.CENTER}
				className={classNames(styles.subTitle, {
					[styles.support]: step === 'support'
				})}
			>
				{title}
			</Text>
			{children}
		</div>
	);
}
