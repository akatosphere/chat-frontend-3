'use client';

import { classNames } from '@/shared/lib/classNames/classNames';
import { Button, ButtonColor, ButtonType } from '@/shared/ui/Button';
import { Smile } from '@icons/index';
import dynamic from 'next/dynamic';
import { useState, useCallback, useRef, useEffect } from 'react';

import cls from './EmojiPickerComponent.module.scss';
import { useClickOutside } from '@/shared/lib/hooks/useClickOutSide/useClickOutside';

const Picker = dynamic(() => import('emoji-picker-react'), {
	ssr: false
});

interface EmojiPickerComponentProps {
	parentClass?: string;
	onEmojiSelect: (emoji: string) => void;
	disabled?: boolean;
	// 👇 Опционально: открывать по ховеру (как в Telegram)
	openOnHover?: boolean;
}

export function EmojiPickerComponent({
	parentClass,
	onEmojiSelect,
	disabled,
	openOnHover = false
}: EmojiPickerComponentProps) {
	const [showPicker, setShowPicker] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const pickerRef = useRef<HTMLDivElement>(null);
	const hoverTimeoutRef = useRef<NodeJS.Timeout>(null);

	//  Закрытие по клику вне
	useClickOutside(pickerRef, () => {
		setShowPicker(false);
	});

	const togglePicker = useCallback(() => {
		setShowPicker(prev => !prev);
	}, []);

	//  Обработчики ховера (если включён openOnHover)
	const handleMouseEnter = useCallback(() => {
		if (!openOnHover || disabled) {
			return;
		}
		setIsHovered(true);
		// Небольшая задержка перед открытием, чтобы избежать случайных срабатываний
		hoverTimeoutRef.current = setTimeout(() => {
			setShowPicker(true);
		}, 200);
	}, [openOnHover, disabled]);

	const handleMouseLeave = useCallback(() => {
		if (!openOnHover) {
			return;
		}
		setIsHovered(false);
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}
		// Закрываем с задержкой, чтобы успеть кликнуть по пику
		hoverTimeoutRef.current = setTimeout(() => {
			setShowPicker(false);
		}, 150);
	}, [openOnHover]);

	// Очистка таймеров при размонтировании
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	const handleEmojiClick = useCallback(
		(emojiData: { emoji: string }) => {
			onEmojiSelect(emojiData.emoji);
			//  НЕ закрываем пикер после выбора
			// Пользователь может выбрать несколько эмодзи подряд
		},
		[onEmojiSelect]
	);

	//  Если открыли по клику — отключаем ховер-логику временно
	const handleButtonClick = useCallback(() => {
		if (openOnHover) {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		}
		togglePicker();
	}, [openOnHover, togglePicker]);

	return (
		<div
			ref={pickerRef}
			className={cls.wrapper}
			style={{ position: 'relative' }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<Button
				color={ButtonColor.TRANSPARENT}
				className={classNames(
					cls.button,
					{ [cls.hovered]: isHovered || showPicker },
					[parentClass]
				)}
				aria-label='Выбрать эмодзи'
				aria-expanded={showPicker}
				disabled={disabled}
				onClick={handleButtonClick}
				btnType={ButtonType.BUTTON}
			>
				<Smile width={20} height={20} />
			</Button>

			{showPicker && (
				<div className={cls.pickerContainer}>
					<Picker
						width={350}
						height={450}
						onEmojiClick={handleEmojiClick}
						className={cls.picker}
						searchDisabled
						previewConfig={{ showPreview: false }}
					/>
				</div>
			)}
		</div>
	);
}
