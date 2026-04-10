'use client';

import { useEditProfileMutation } from '@/entities/Profile/api/editProfile.api';
import { FormAuthItem, useSetAuthStep } from '@/features/auth';
import { useSendNicknameMutation } from '@/features/auth/api/authApi';
import { IRegister } from '@/features/auth/model/types/auth.types';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import {
	Button,
	ButtonColor,
	ButtonTheme,
	ButtonType
} from '@/shared/ui/Button';
import { Form } from '@/shared/ui/FormComponent';
import { Loader } from '@/shared/ui/Loader';
import {
	FontWeight,
	Text,
	TextColor,
	TextSize,
	TextType
} from '@/shared/ui/Text';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { registerFormItems } from '../../model/const/registerFormItems';
import { getServerErrorMessage } from '../../model/lib/getServerErrorMessage';
import styles from './RegisterForm.module.scss';

export function RegisterForm() {
	const [responseError, setResponseError] = useState<string | null>(null);
	const methods = useForm<IRegister>({
		mode: 'onBlur'
	});

	const { control, setError, clearErrors } = methods;

	const name = useWatch({ control, name: 'name' });
	const nickname = useWatch({ control, name: 'nickname' });
	const [
		sendNickname,
		{ data: nicknameResponse, isLoading: nicknameLoading, error: nicknameError }
	] = useSendNicknameMutation();
	const handleSendNickname = useCallback(
		(value: string) => {
			setResponseError('');
			sendNickname(value);
		},
		[sendNickname]
	);
	const debouncedSendNickname = useDebounce(handleSendNickname, 400);
	const setStep = useSetAuthStep();
	const isNicknameFree =
		nicknameResponse?.messages === 'Этот nickname свободен';
	const [editProfile, { isLoading }] = useEditProfileMutation();
	const errorMessage = isLoading || nicknameLoading ? null : responseError;
	const disabledSubmit =
		!name ||
		!nickname ||
		!isNicknameFree ||
		name.length < 3 ||
		nickname.length < 5;

	useEffect(() => {
		if (!nickname || nickname.length < 5) {
			return;
		}
		clearErrors(['nickname']);
		debouncedSendNickname(nickname);
	}, [nickname, debouncedSendNickname, clearErrors]);

	useEffect(() => {
		if (isNicknameFree) {
			clearErrors();
		}
	}, [isNicknameFree, clearErrors]);

	useEffect(() => {
		if (!nicknameError) {
			return;
		}

		getServerErrorMessage(nicknameError, setResponseError, setError);
	}, [nicknameError, setError]);

	const onSubmit: SubmitHandler<IRegister> = async data => {
		setResponseError('');

		const newData = {
			first_name: data.name,
			nickname: data.nickname
		};

		try {
			const result = await editProfile(newData).unwrap();

			if (result) {
				setStep('finish-register');
			}
		} catch (error: unknown) {
			const err = error as FetchBaseQueryError | SerializedError;
			getServerErrorMessage(err, setResponseError, setError);
		}
	};

	return (
		<>
			<Form<IRegister>
				methods={methods}
				onSubmit={onSubmit}
				className={styles.form}
			>
				<div className={styles.inputsWrapper}>
					{registerFormItems.map(item => (
						<FormAuthItem
							key={item.name}
							type={item.type}
							name={item.name}
							label={item.label}
							rules={item.rules}
						/>
					))}
				</div>
				<Text
					type={TextType.TEXT}
					fontSize={TextSize.S}
					color={TextColor.GRAY}
					fontWeight={FontWeight.MEDIUM}
					className={styles.text}
				>
					Нажимая на «Зарегистрироваться», вы соглашаетесь с 
					<Link href='/' className={styles.link}>
						Пользовательским соглашением
					</Link>
				</Text>
				{errorMessage && (
					<Text
						color={TextColor.ERROR}
						type={TextType.TEXT}
						fontSize={TextSize.M}
					>
						{errorMessage}
					</Text>
				)}

				<Button
					btnType={ButtonType.SUBMIT}
					disabled={disabledSubmit}
					theme={ButtonTheme.BACKGROUND}
					color={ButtonColor.PRIMARY}
				>
					{isLoading ? (
						<Loader width='22px' height='22px' />
					) : (
						'Зарегистрироваться'
					)}
				</Button>
			</Form>
		</>
	);
}
