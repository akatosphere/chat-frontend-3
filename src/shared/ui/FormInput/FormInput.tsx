import React from 'react';
import {
	UseFormRegister,
	Path,
	RegisterOptions,
	FieldErrors,
	FieldValues
} from 'react-hook-form';
import { Input, InputProps } from '../Input/Input';

interface FormInputProps<TFormValues extends FieldValues> extends Omit<
	InputProps,
	'name'
> {
	name: Path<TFormValues>;
	register: UseFormRegister<TFormValues>;
	rules?: RegisterOptions<TFormValues>;
	errors?: FieldErrors<TFormValues>;
}

export const FormInput = <TFormValues extends FieldValues>({
	name,
	register,
	rules,
	errors,
	...props
}: FormInputProps<TFormValues>) => {
	const fieldError = errors?.[name];

	const errorMessage = fieldError?.message as string | undefined;

	return (
		<Input
			{...props}
			{...register(name, rules)}
			error={errorMessage}
			id={name}
		/>
	);
};
