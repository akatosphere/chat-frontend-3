import cls from './PaginationLoader.module.scss';

interface PaginationLoaderProps {
	isLoading: boolean;
	className?: string;
}

export const PaginationLoader = ({
	isLoading,
	className = ''
}: PaginationLoaderProps) => {
	if (!isLoading) {
		return null;
	}

	return (
		<div
			className={`${cls.loader} ${className}`}
			role='status'
			aria-live='polite'
		>
			<div className={cls.spinner} aria-hidden='true' />
			<span className={cls.text}>Загрузка...</span>
		</div>
	);
};
