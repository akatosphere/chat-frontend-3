const CopyMessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
			viewBox='0 0 23 28'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M0 1.5C0 0.671573 0.671573 0 1.5 0H16.7711V3H3V19.7269H0V1.5ZM5.01963 6.48448C5.01963 5.65606 5.6912 4.98448 6.51963 4.98448H21.2589C22.0873 4.98448 22.7589 5.65606 22.7589 6.48448V25.7077C22.7589 26.5361 22.0873 27.2077 21.2589 27.2077H6.51963C5.6912 27.2077 5.01963 26.5361 5.01963 25.7077V6.48448ZM8.01963 7.98448V24.2077H19.7589V7.98448H8.01963Z'
				fill='currentColor'
			/>
		</svg>
	);
};

export default CopyMessageIcon;
