const BackIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
			viewBox='0 0 12 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<path
				d='M11.319 1.41904L9.89995 0L0 9.9037L9.90387 19.8076L11.3223 18.3892L2.83556 9.90247L11.319 1.41904Z'
				fill='currentColor'
			/>
		</svg>
	);
};

export default BackIcon;
