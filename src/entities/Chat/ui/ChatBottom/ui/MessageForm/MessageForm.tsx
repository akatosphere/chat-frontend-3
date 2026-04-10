'use client';

import { Form, Textarea } from '@/shared/ui/FormComponent';
import {
	KeyboardEvent,
	useEffect,
	forwardRef,
	useImperativeHandle,
	useRef
} from 'react';
import { useForm } from 'react-hook-form';
import { MessageFormTypes } from '@/entities/Chat/model/types/chat.types/chat.types';
import { EmojiPickerComponent } from '../EmojiPickerComponent/EmojiPickerComponent';

import cls from './MessageForm.module.scss';

export type MessageFormRef = {
	reset: () => void;
	focus: () => void;
};

interface MessageFormProps {
	onSendContent: (message: string) => void;
	disabled?: boolean;
	onTextChanged?: (isFilled: boolean) => void;
	onMessageChange?: (text: string) => void;
	onReset?: () => void;
}

export const MessageForm = forwardRef<MessageFormRef, MessageFormProps>(
	(
		{ onSendContent, disabled, onTextChanged, onMessageChange, onReset },
		ref
	) => {
		const methods = useForm<MessageFormTypes>({
			defaultValues: { message: '' }
		});
		const { getValues, handleSubmit, reset, watch, setValue } = methods;
		const message = watch('message');
		const isFilled = message.trim().length > 0;

		const textareaRef = useRef<HTMLTextAreaElement>(null);

		useImperativeHandle(
			ref,
			() => ({
				reset: () => {
					reset();
					onReset?.();

					if (textareaRef.current) {
						textareaRef.current.style.height = 'auto';
						textareaRef.current.style.height = '21px';
						textareaRef.current.dispatchEvent(
							new Event('input', { bubbles: true })
						);
					}
				},
				focus: () => {
					textareaRef.current?.focus();
				}
			}),
			[reset, onReset]
		);

		useEffect(() => {
			onTextChanged?.(isFilled);
			onMessageChange?.(message);
		}, [isFilled, onTextChanged, onMessageChange, message]);

		useEffect(() => {
			if (disabled) {
				return;
			}

			const timer = setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
					const len = textareaRef.current.value.length;
					textareaRef.current.setSelectionRange(len, len);
				}
			}, 0);

			return () => clearTimeout(timer);
		}, [disabled]);

		const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSubmit(onSubmit)();
			}
		};

		const onEmojiSelect = (emoji: string) => {
			if (!textareaRef.current) {
				return;
			}

			const start = textareaRef.current.selectionStart;
			const end = textareaRef.current.selectionEnd;
			const current = getValues('message');
			const newMessage = current.slice(0, start) + emoji + current.slice(end);

			setValue('message', newMessage, {
				shouldDirty: true,
				shouldTouch: true
			});

			requestAnimationFrame(() => {
				const cursor = start + emoji.length;
				if (textareaRef.current) {
					textareaRef.current.selectionStart = cursor;
					textareaRef.current.selectionEnd = cursor;
					textareaRef.current.focus();
				}
			});
		};

		const onSubmit = async (data: MessageFormTypes) => {
			const trimmed = data.message.trim();
			if (!trimmed) {
				return;
			}
			await onSendContent(trimmed);
			reset();
			onReset?.();
		};

		return (
			<Form<MessageFormTypes>
				methods={methods}
				onSubmit={onSubmit}
				className={cls.messageForm}
			>
				<div className={cls.textareaWrapper}>
					<Textarea
						name='message'
						classNameTextarea={cls.textarea}
						height='21px'
						onKeyDown={handleKeyDown}
						placeholder='Сообщение...'
						disabled={disabled}
						textareaRef={textareaRef}
						rules={{}}
					/>
					<EmojiPickerComponent
						onEmojiSelect={onEmojiSelect}
						disabled={disabled}
					/>
				</div>
			</Form>
		);
	}
);

MessageForm.displayName = 'MessageForm';
