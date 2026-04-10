'use client';

import { Button, ButtonColor, ButtonTheme } from '@/shared/ui/Button';
import { Paperclip, SelectImg, SelectFile } from '@icons/index';
import { useRef, useState } from 'react';
import { VoiceFile } from '@/entities/Chat/model/types/chat.types/chat.types';
import { blobToBase64 } from '../../../../model/lib/service/blobToBase64/blobToBase64';
import { KebabMenu } from '@/shared/ui/KebabMenu';
import { KebabMenuItem } from '@/shared/ui/KebabMenu/model/types/type'; // уточните путь при необходимости

import cls from './AttachmentButton.module.scss';

interface AttachmentButtonProps {
	setFiles: (files: VoiceFile[]) => void;
	disabled?: boolean;
}

export function AttachmentButton({
	setFiles,
	disabled
}: AttachmentButtonProps) {
	const imageInputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleFileSelect = async (file: File | null) => {
		if (!file) {
			return;
		}

		try {
			const base64 = await blobToBase64(file);
			setFiles([
				{
					filename: file.name,
					data: base64,
					type: file.type
				}
			]);
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('File conversion error:', error);
			}
		}

		if (imageInputRef.current) {
			imageInputRef.current.value = '';
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileSelect(e.target.files?.[0] || null);
	};

	const handleGeneralFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileSelect(e.target.files?.[0] || null);
	};

	const menuItems: KebabMenuItem[] = [
		{
			text: 'Выбрать изображение',
			icon: <SelectImg className={cls.menuIcon} />,
			onClick: () => imageInputRef.current?.click()
		},
		{
			text: 'Выбрать файл',
			icon: <SelectFile className={cls.menuIcon} />,
			onClick: () => fileInputRef.current?.click()
		}
	];

	return (
		<div className={cls.wrapper}>
			<Button
				theme={ButtonTheme.CIRCLE}
				color={ButtonColor.TRANSPARENT}
				className={cls.button}
				aria-label='Выбрать файл'
				onClick={() => setIsMenuOpen(prev => !prev)}
				disabled={disabled}
			>
				<Paperclip className={cls.icon} />
			</Button>

			<KebabMenu
				className={cls.menu}
				visible={isMenuOpen}
				items={menuItems}
				onClose={() => setIsMenuOpen(false)}
			/>

			<input
				type='file'
				ref={imageInputRef}
				className={cls.visuallyHidden}
				onChange={handleImageSelect}
				accept='image/*'
				disabled={disabled}
			/>
			<input
				type='file'
				ref={fileInputRef}
				className={cls.visuallyHidden}
				onChange={handleGeneralFileSelect}
				accept='image/*,audio/*,video/*,.pdf,.doc,.docx'
				disabled={disabled}
			/>
		</div>
	);
}
