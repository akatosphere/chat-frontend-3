const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='2' />
			<circle cx='12' cy='7.5' r='0.5' fill='currentColor' />
			<path d='M12 17V10' stroke='currentColor' strokeWidth='2' />
		</svg>
	);
};

export default InfoIcon;
