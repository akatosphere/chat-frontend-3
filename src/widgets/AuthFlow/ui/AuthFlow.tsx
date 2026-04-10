import {
	EnterCode,
	EnterPhoneForm,
	FinishRegister,
	LoginGreeting,
	Register,
	SupportSuccess,
	useAuthStep
} from '@/features/auth';
import { SupportForm } from '@/features/support';
import { LoginWrapper } from '@/shared/ui/LoginWrapper';

interface AuthFlowProps {
	containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const AuthFlow = ({ containerRef }: AuthFlowProps) => {
	const step = useAuthStep();

	switch (step) {
		case 'greeting':
			return <LoginGreeting />;

		case 'phone':
			return (
				<LoginWrapper>
					<EnterPhoneForm containerRef={containerRef} />
				</LoginWrapper>
			);

		case 'code':
			return (
				<LoginWrapper>
					<EnterCode />
				</LoginWrapper>
			);

		case 'register':
			return (
				<LoginWrapper>
					<Register />
				</LoginWrapper>
			);

		case 'finish-register':
			return <FinishRegister />;

		case 'support':
			return (
				<LoginWrapper>
					<SupportForm marginTop='0' />
				</LoginWrapper>
			);

		case 'success-support':
			return (
				<LoginWrapper>
					<SupportSuccess />
				</LoginWrapper>
			);

		default:
			return null;
	}
};

// import {
// 	EnterPhoneForm,
// 	FinishRegister,
// 	LoginGreeting,
// 	Register,
// 	SupportSuccess,
// 	useAuthStep
// } from '@/features/auth';
// import { SupportForm } from '@/features/support';
// import { LoginWrapper } from '@/shared/ui/LoginWrapper';
// import { FormProvider, useForm } from 'react-hook-form';

// interface AuthFlowProps {
// 	containerRef?: React.RefObject<HTMLDivElement | null>;
// }

// export const AuthFlow = ({ containerRef }: AuthFlowProps) => {
// 	const methods = useForm({
// 		defaultValues: {
// 			phone_number: '',
// 			nickname: '',
// 			name: ''
// 		}
// 	});

// 	const step = useAuthStep();

// 	console.log(step);

// 	if (step === 'greeting') {
// 		return <LoginGreeting />;
// 	}

// 	return (
// 		<FormProvider {...methods}>
// 			<LoginWrapper>
// 				{step === 'phone' && <EnterPhoneForm containerRef={containerRef} />}
// 				{step === 'register' && <Register />}
// 				{step === 'finish-register' && <FinishRegister />}
// 				{step === 'support' && <SupportForm marginTop='0' />}
// 				{step === 'success-support' && <SupportSuccess />}
// 			</LoginWrapper>
// 		</FormProvider>
// 	);
// };
