'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/shared/ui/FormInput/FormInput';

// 1. Описываем, как выглядит наша "посылка" с данными
interface RegistrationData {
	firstName: string;
	lastName: string;
	phone: string;
}

export default function RegistrationPage() {
	// 2. Инициализируем "пульт управления" формой
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<RegistrationData>({
		mode: 'onChange' // Чтобы ошибки подсвечивались сразу
	});

	// 3. Эта функция сработает, когда ВСЕ 3 поля заполнены верно
	const onSubmit = (data: RegistrationData) => {
		console.log('📦 Упакованные данные:', data);

		// В консоли ты увидишь:
		// {
		//   firstName: "Иван",
		//   lastName: "Иванов",
		//   phone: "+7 (999) 000-00-00"
		// }

		alert(`Отправляем: ${data.firstName} ${data.lastName}`);
	};

	return (
		<div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
			<h1>Регистрация</h1>

			{/* 4. ЕДИНАЯ ФОРМА-ОБЕРТКА */}
			<form
				onSubmit={handleSubmit(onSubmit)}
				style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
			>
				<FormInput
					name='firstName'
					label='Имя'
					placeholder='Иван'
					register={register}
					errors={errors}
					rules={{
						required: 'Имя обязательно',
						minLength: { value: 2, message: 'Минимум 2 буквы' }
					}}
				/>

				<FormInput
					name='lastName'
					label='Фамилия'
					placeholder='Иванов'
					register={register}
					errors={errors}
					rules={{
						required: 'Фамилия обязательна'
					}}
				/>

				<button
					type='submit'
					style={{
						marginTop: 20,
						padding: '10px 20px',
						background: 'blue',
						color: 'white'
					}}
				>
					Отправить
				</button>
			</form>
		</div>
	);
}
