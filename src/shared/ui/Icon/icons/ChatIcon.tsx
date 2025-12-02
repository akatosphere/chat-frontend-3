const ChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	return (
		<svg
			viewBox='0 0 32 32'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<path
				d='M26.668 2.66797H5.33464C3.86797 2.66797 2.66797 3.86797 2.66797 5.33464V29.3346L8.0013 24.0013H26.668C28.1346 24.0013 29.3346 22.8013 29.3346 21.3346V5.33464C29.3346 3.86797 28.1346 2.66797 26.668 2.66797ZM26.668 21.3346H8.0013L5.33464 24.0013V5.33464H26.668V21.3346Z'
				fill='currentColor'
			/>
		</svg>
	);
};
export default ChatIcon;
