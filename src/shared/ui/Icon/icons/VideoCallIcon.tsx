const ClearIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
			viewBox='0 0 20 14'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<path
				d='M19 2.71429L13.2727 7L19 11.2857V2.71429Z'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M11.6364 1H2.63636C1.73262 1 1 1.76751 1 2.71429V11.2857C1 12.2325 1.73262 13 2.63636 13H11.6364C12.5401 13 13.2727 12.2325 13.2727 11.2857V2.71429C13.2727 1.76751 12.5401 1 11.6364 1Z'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default ClearIcon;
