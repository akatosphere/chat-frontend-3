const UnReadMessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<path
				d='M4 2.5H20C20.8239 2.5 21.5 3.17614 21.5 4V20.793L18.207 17.5H4C3.17614 17.5 2.5 16.8239 2.5 16V4C2.5 3.17614 3.17614 2.5 4 2.5ZM3.5 16.5H18.623L20.5 18.377V3.5H3.5V16.5Z'
				fill='currentColor'
				stroke='currentColor'
			/>
			<circle cx='19' cy='5' r='5' fill='#7769E1' />
		</svg>
	);
};

export default UnReadMessageIcon;
