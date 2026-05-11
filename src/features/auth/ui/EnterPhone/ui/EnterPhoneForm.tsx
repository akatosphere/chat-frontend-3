'use client';

import { useEffect, useRef, useState } from 'react';
import { FormAuthItem, useSetAuthStep } from '@/features/auth';
import {
	formatPhone,
	maskPhone,
	unmaskPhone
} from '@/shared/lib/formatPhone/formatPhone';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import {
	Button,
	ButtonColor,
	ButtonTheme,
	ButtonType
} from '@/shared/ui/Button';
import { Form } from '@/shared/ui/FormComponent/Form/ui/Form';
import { Modal } from '@/shared/ui/Modal';
import {
	FontWeight,
	Text,
	TextColor,
	TextSize,
	TextType
} from '@/shared/ui/Text';
import { useForm, useWatch } from 'react-hook-form';
import { useStartPlusofonMutation } from '../../../api/authApi';
import { formItems } from '../model/const/formItems';
import { FormItemAutocomplete } from '@/shared/ui/FormComponent/FormItems/model/types';
import { logger } from '@/shared/lib/logger/logger';
import { getErrorMessage } from '@/shared/lib/errorMessage/errorMessage';

import cls from './EnterPhoneForm.module.scss';

interface LoginPhoneForm {
	phone_number: string;
}

export const EnterPhoneForm = ({
	containerRef
}: {
	containerRef?: React.RefObject<HTMLDivElement | null>;
}) => {
	const { phone_number: storedPhone } = useAppSelector(state => state.auth);

	const [startPlusofon, { isLoading: isSending }] = useStartPlusofonMutation();

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const confirmBtnRef = useRef<HTMLButtonElement>(null);
	const setStep = useSetAuthStep();

	const isMobile = useMediaQuery();
	const overlayMode = isMobile ? 'full' : 'container';
	const borderRadius = isMobile ? '8px' : '16px';

	const methods = useForm<LoginPhoneForm>({
		defaultValues: {
			phone_number: storedPhone || ''
		}
	});
	const { setFocus } = methods;

	const phone_number = useWatch({
		control: methods.control,
		name: 'phone_number'
	});

	useEffect(() => {
		if (!phone_number) {
			return;
		}

		const hasDigits = /\d/.test(phone_number);
		const hasMask = phone_number.includes('(') || phone_number.includes('-');

		if (hasDigits && !hasMask) {
			const masked = maskPhone(phone_number);
			if (masked !== phone_number) {
				methods.setValue('phone_number', masked, {
					shouldValidate: true,
					shouldDirty: true
				});
			}
		}
	}, [phone_number, methods]);

	const cleanPhone = unmaskPhone(phone_number || '');
	const isValidPhone = /^\d{10,11}$/.test(cleanPhone);
	const disabled = isSending || !isValidPhone;

	useEffect(() => {
		setFocus('phone_number');
	}, [setFocus]);

	useEffect(() => {
		if (isModalOpen && confirmBtnRef.current) {
			confirmBtnRef.current.focus();
		}
	}, [isModalOpen]);

	const onModalClose = () => {
		setIsModalOpen(false);
	};

	const onConfirm = async () => {
		const cleanNumber = unmaskPhone(phone_number || '');

		const e164Phone = cleanNumber.startsWith('7')
			? `+${cleanNumber}`
			: `+7${cleanNumber}`;

		try {
			const result = await startPlusofon({ phone_number: e164Phone }).unwrap();

			if ('session_uid' in result) {
				onModalClose();
				setStep('reverse_call');
			} else {
				const err = result as { message?: string };
				logger.warn('Auth blocked', {
					category: 'auth',
					prefix: err.message || 'Unknown reason'
				});
			}
		} catch (err: unknown) {
			logger.error('Failed to start auth', {
				category: 'auth',
				prefix: getErrorMessage(err)
			});
		}
	};

	return (
		<>
			<Form<LoginPhoneForm>
				methods={methods}
				onSubmit={() => setIsModalOpen(true)}
				className={cls.form}
			>
				{formItems.map(item => (
					<FormAuthItem
						key={item.name}
						type={item.type}
						name={item.name}
						label={item.label}
						placeholder={item.placeholder}
						autoComplete={FormItemAutocomplete.PHONE}
						disabled={item.disabled || isSending}
						rules={undefined}
						classNameParentInput={cls.formItem}
					/>
				))}
				<Button
					btnType={ButtonType.SUBMIT}
					disabled={disabled}
					theme={ButtonTheme.BACKGROUND}
					color={ButtonColor.PRIMARY}
				>
					Далее
				</Button>
			</Form>

			<Modal
				size='wide'
				isOpen={isModalOpen}
				onClose={onModalClose}
				className={cls.modal}
				overlayMode={overlayMode}
				containerRef={containerRef}
				borderRadius={borderRadius}
			>
				<Text
					type={TextType.TEXT}
					fontSize={TextSize.L}
					fontWeight={FontWeight.MEDIUM}
					color={TextColor.BLACK}
					className={cls.modalPhone}
				>
					{formatPhone(cleanPhone)}{' '}
				</Text>

				<Text
					type={TextType.TEXT}
					fontSize={TextSize.M}
					fontWeight={FontWeight.REGULAR}
					color={TextColor.GRAY}
					className={cls.modalText}
				>
					Номер телефона указан верно?
				</Text>

				<Modal.Actions className={cls.actions}>
					<Button
						color={ButtonColor.PRIMARY}
						onClick={onModalClose}
						className={cls.btnCancel}
						theme={ButtonTheme.CLEAR}
						disabled={isSending}
					>
						Изменить
					</Button>
					<Button
						color={ButtonColor.PRIMARY}
						onClick={onConfirm}
						className={cls.btnConfirm}
						btnRef={confirmBtnRef}
					>
						Верно
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	);
};
