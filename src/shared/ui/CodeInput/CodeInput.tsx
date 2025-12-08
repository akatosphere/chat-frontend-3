'use client';
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import styles from '@/shared/ui/CodeInput/CodeInput.module.scss';
import clsx from 'clsx';

interface CodeInputProps {
	length?: number;
	value: string;
	onChange: (value: string) => void;
	error?: boolean;
	disabled?: boolean;
}

export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(
	({ length = 4, value, onChange, error, disabled }, ref) => {
		const localInputRef = useRef<HTMLInputElement>(null);

		useImperativeHandle(ref, () => localInputRef.current as HTMLInputElement);

		const handleClick = () => {
			if (localInputRef.current) {
				localInputRef.current.focus();
				localInputRef.current.setSelectionRange(value.length, value.length);
			}
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const val = e.target.value.replace(/\D/g, '').slice(0, length);
			onChange(val);
		};

		const cells = Array.from({ length }, (_, index) => value[index] || '');

		return (
			<div
				className={clsx(styles.container, {
					[styles.error]: error,
					[styles.disabled]: disabled
				})}
				onClick={handleClick}
				role='button'
				tabIndex={-1}
			>
				<div className={styles.cells}>
					{cells.map((char, index) => (
						<div
							key={index}
							className={clsx(styles.cell, {
								[styles.active]: !disabled && index === value.length,
								[styles.filled]: !!char
							})}
						>
							{char}
						</div>
					))}
				</div>

				<input
					ref={localInputRef}
					className={styles.hiddenInput}
					value={value}
					onChange={handleChange}
					type='tel'
					autoComplete='one-time-code'
					disabled={disabled}
				/>
			</div>
		);
	}
);

CodeInput.displayName = 'CodeInput';
