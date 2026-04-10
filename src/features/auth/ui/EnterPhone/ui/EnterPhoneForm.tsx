'use client';

import { FormAuthItem, useSetAuthStep } from '@/features/auth';
import { formatPhone } from '@/shared/lib/formatPhone/formatPhone';
import { useAppSelector } from '@/shared/lib/hooks/useAppSelector/useAppSelector';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery'; // ваш хук
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
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
	useCheckStatusMutation,
	useSendPhoneMutation
} from '../../../api/authApi';
import { formItems } from '../model/const/formItems';
import styles from './EnterPhoneForm.module.scss';

interface LoginPhoneForm {
	phone_number: string;
}

export const EnterPhoneForm = ({
	containerRef
}: {
	containerRef?: React.RefObject<HTMLDivElement | null>;
}) => {
	const {
		isDisabledCodeAttempts,
		phone_number: phone,
		phoneSession
	} = useAppSelector(state => state.auth);

	const [sendPhone] = useSendPhoneMutation();
	const [checkStatus, { data: statusData, isLoading: isPolling }] =
		useCheckStatusMutation();

	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const confirmBtnRef = useRef<HTMLButtonElement>(null);
	const setStep = useSetAuthStep();
	const formattedPhone = formatPhone(phone);

	const isMobile = useMediaQuery();
	const overlayMode = isMobile ? 'full' : 'container';
	const borderRadius = isMobile ? '8px' : '16px';

	const methods = useForm<LoginPhoneForm>({
		defaultValues: {
			phone_number: formattedPhone || ''
		}
	});
	const { setFocus } = methods;

	const phone_number = useWatch({
		control: methods.control,
		name: 'phone_number'
	});

	const disabled = isDisabledCodeAttempts || phone_number.length !== 16;

	useEffect(() => {
		setFocus('phone_number');
	}, [setFocus]);

	useEffect(() => {
		if (isModalOpen && confirmBtnRef.current) {
			confirmBtnRef?.current.focus();
		}
	}, [isModalOpen]);

	useEffect(() => {
		if (!phoneSession?.session_uid || !phoneSession.session_secret) {
			return;
		}

		if (
			statusData &&
			(statusData.status === 'consumed' ||
				statusData.status === 'verified' ||
				!statusData.is_claim_available)
		) {
			return;
		}

		const intervalMs = phoneSession.poll_interval_seconds
			? phoneSession.poll_interval_seconds * 1000
			: 2000;

		const interval = setInterval(async () => {
			try {
				await checkStatus({
					session_uid: phoneSession.session_uid!,
					session_secret: phoneSession.session_secret!
				});
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('claimTokens error:', error);
				}
			}
		}, intervalMs);

		return () => clearInterval(interval);
	}, [
		phoneSession?.session_uid,
		phoneSession?.session_secret,
		checkStatus,
		phoneSession?.poll_interval_seconds,
		phoneSession?.blocked_until,
		statusData
	]);

	const claimTokens = useCallback(async () => {
		if (!phoneSession?.session_uid || !phoneSession.session_secret) {
			return;
		}

		try {
			const response = await fetch('/api/auth/setTokens', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					session_uid: phoneSession.session_uid,
					session_secret: phoneSession.session_secret
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message);
			}

			const data = await response.json();
			if (data.success) {
				if (data.is_filled) {
					router.push('/chats');
				} else {
					setStep('register');
				}
			}
		} catch (_) {}
	}, [
		phoneSession?.session_uid,
		phoneSession?.session_secret,
		setStep,
		router
	]);

	useEffect(() => {
		if (statusData?.status === 'verified' && statusData.is_claim_available) {
			claimTokens();
		}
	}, [statusData?.status, statusData?.is_claim_available, claimTokens]);

	const onModalClose = () => {
		setIsModalOpen(false);
	};

	const onConfirm = async () => {
		const formattedPhone = phone_number.replace(/[^\d+]/g, '');
		await sendPhone({ phone_number: formattedPhone });
		onModalClose();
	};

	return (
		<>
			<Form<LoginPhoneForm>
				methods={methods}
				onSubmit={() => setIsModalOpen(true)}
				className={styles.form}
			>
				{formItems.map(item => (
					<FormAuthItem
						key={item.name}
						type={item.type}
						name={item.name}
						label={item.label}
						placeholder={item.placeholder}
						autoComplete={undefined}
						disabled={item.disabled}
						rules={undefined}
						classNameParentInput={styles.formItem}
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
				className={styles.modal}
				overlayMode={overlayMode}
				containerRef={containerRef}
				borderRadius={borderRadius}
			>
				<Text
					type={TextType.TEXT}
					fontSize={TextSize.L}
					fontWeight={FontWeight.MEDIUM}
					color={TextColor.BLACK}
					className={styles.modalPhone}
				>
					{phone_number}
				</Text>
				<Text
					type={TextType.TEXT}
					fontSize={TextSize.M}
					fontWeight={FontWeight.REGULAR}
					color={TextColor.GRAY}
					className={styles.modalText}
				>
					Номер телефона указан верно?
				</Text>

				<Modal.Actions className={styles.actions}>
					<Button
						color={ButtonColor.PRIMARY}
						onClick={onModalClose}
						className={styles.btnCancel}
						theme={ButtonTheme.CLEAR}
					>
						Изменить
					</Button>
					<Button
						color={ButtonColor.PRIMARY}
						onClick={onConfirm}
						className={styles.btnConfirm}
						btnRef={confirmBtnRef}
					>
						Верно
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	);
};
