const DownIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
			viewBox='0 0 12 8'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<path
				d='M10.59 0L6 4.58L1.41 0L0 1.41L6 7.41L12 1.41L10.59 0Z'
				fill='currentColor'
			/>
		</svg>
	);
};

export default DownIcon;
