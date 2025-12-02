import React from 'react';
import * as Icons from './icons/index';
import { IconProps } from './types';

const Icon: React.FC<IconProps> = ({
	name,
	color,
	size = 24,
	className,
	style,
	...restProps
}) => {
	const iconName = (name.charAt(0).toUpperCase() +
		name.slice(1) +
		'Icon') as keyof typeof Icons;
	const IconComponent = Icons[iconName];

	if (!IconComponent) {
		console.warn(`[Icon] Component "${name}" not found.`);
		return null;
	}

	const finalStyle: React.CSSProperties = {
		...style,
		width: size,
		height: size,
		display: 'block',
		...(color != null ? { color } : {})
	};

	return (
		<IconComponent className={className} style={finalStyle} {...restProps} />
	);
};

export default Icon;
