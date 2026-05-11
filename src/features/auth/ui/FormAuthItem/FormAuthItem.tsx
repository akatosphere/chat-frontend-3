'use client';

import { classNames } from '@/shared/lib/classNames/classNames';
import { Label } from '@/shared/ui/FormComponent';
import {
	FormItemAutocomplete,
	FormItemType
} from '@/shared/ui/FormComponent/FormItems/model/types';
import { useEffect } from 'react';
import {
	FieldValues,
	Path,
	RegisterOptions,
	useFormContext
} from 'react-hook-form';
import { RenderAuthInputByType } from './RenderAuthInputByType';

import styles from './FormAuthItem.module.scss';

interface FormItemProps<TFormValues extends FieldValues> {
	name: Path<TFormValues>;
	type: FormItemType;
	label?: string;
	placeholder?: string;
	autoComplete?: FormItemAutocomplete;
	disabled?: boolean;
	rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
	parentLabelClass?: string;
	classNameParentInput?: string;
	classNameParentWrapper?: string;
	onValueChange?: (value: string) => void; // для реакции на ввод сразу
}

export function FormAuthItem<TFormValues extends FieldValues>({
	name,
	type,
	label,
	placeholder,
	disabled,
	onValueChange,
	rules,
	classNameParentInput,
	classNameParentWrapper,
	parentLabelClass
}: FormItemProps<TFormValues>) {
	const {
		control,
		watch,
		formState: { errors }
	} = useFormContext<TFormValues>();
	const errorMessage = errors?.[name]?.message as string | undefined;
	const isError = Boolean(errorMessage);
	const value = watch(name);

	useEffect(() => {
		if (onValueChange) {
			onValueChange(value ?? '');
		}
	}, [value, onValueChange]);

	const inputElement = RenderAuthInputByType({
		type,
		name,
		placeholder,
		disabled,
		isError,
		control,
		rules,
		classNameParentInput
	});

	return (
		<div
			className={classNames(styles.inputWrapper, {}, [classNameParentWrapper])}
		>
			<Label parentLabelClass={parentLabelClass} name={name}>
				{label}
			</Label>
			{inputElement}
		</div>
	);
}
