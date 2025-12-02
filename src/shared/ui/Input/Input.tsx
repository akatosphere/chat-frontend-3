import React, { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.scss';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
	isRequired?: boolean;
	icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			label,
			error,
			helperText,
			isRequired,
			icon,
			disabled,
			...props
		},
		ref
	) => {
		const hasError = !!error;

		return (
			<div className={clsx(styles.container, className)}>
				{label && (
					<label className={styles.label}>
						{label}
						{isRequired && <span className={styles.required}>*</span>}
					</label>
				)}

				<div
					className={clsx(styles.inputWrapper, {
						[styles.hasError]: hasError,
						[styles.disabled]: disabled
					})}
				>
					<input
						ref={ref}
						className={styles.input}
						disabled={disabled}
						aria-invalid={hasError}
						aria-describedby={error ? `${props.id}-error` : undefined}
						{...props}
					/>
					{icon && <div className={styles.icon}>{icon}</div>}
				</div>

				{error && (
					<span
						id={`${props.id}-error`}
						className={styles.errorText}
						role='alert'
					>
						{error}
					</span>
				)}
				{!error && helperText && (
					<span className={styles.helperText}>{helperText}</span>
				)}
			</div>
		);
	}
);

Input.displayName = 'Input';
