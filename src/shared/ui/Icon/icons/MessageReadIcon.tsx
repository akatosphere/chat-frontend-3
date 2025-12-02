const MessageReadIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
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
			<path
				d='M8.44141 9.64989L11.0668 12.2731L17.168 6.17188'
				stroke='currentColor'
				strokeWidth='2'
			/>
		</svg>
	);
};

export default MessageReadIcon;
