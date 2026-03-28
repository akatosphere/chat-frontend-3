'use client';
import { KebabMenuItem } from '@/shared/ui/KebabMenu/model/types/type';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface ContextMenuState {
	isVisible: boolean;
	position: { x: number; y: number } | null;
	items: KebabMenuItem[];
}

export const useContextMenu = () => {
	const [state, setState] = useState<ContextMenuState>({
		isVisible: false,
		position: null,
		items: []
	});

	const MENU_OFFSET = 4;
	const MENU_WIDTH = 220;
	const MENU_HEIGHT = 170;

	// Вычисляем корректированную позицию
	const calculatePosition = useCallback((x: number, y: number) => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let newX = x;
		let newY = y;

		// Горизонталь
		if (x + MENU_WIDTH > viewportWidth) {
			newX = viewportWidth - MENU_WIDTH - MENU_OFFSET;
		}
		if (newX < MENU_OFFSET) {
			newX = MENU_OFFSET;
		}

		// Вертикаль
		if (y + MENU_HEIGHT > viewportHeight) {
			newY = viewportHeight - MENU_HEIGHT - MENU_OFFSET;
		}
		if (newY < MENU_OFFSET) {
			newY = MENU_OFFSET;
		}

		return { x: newX, y: newY };
	}, []);

	const showMenu = useCallback(
		(items: KebabMenuItem[], x: number, y: number) => {
			const correctedPosition = calculatePosition(x, y);

			setState({
				isVisible: true,
				position: correctedPosition,
				items
			});
		},
		[calculatePosition]
	);

	const hideMenu = useCallback(() => {
		setState({ isVisible: false, position: null, items: [] });
	}, []);

	const handleContextMenu = useCallback(
		(e: React.MouseEvent, items: KebabMenuItem[]) => {
			e.preventDefault();
			e.stopPropagation();
			showMenu(items, e.clientX, e.clientY);
		},
		[showMenu]
	);

	// Закрытие по клику вне
	useEffect(() => {
		const handleClick = () => {
			if (state.isVisible) {
				hideMenu();
			}
		};
		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	}, [hideMenu, state.isVisible]);

	return useMemo(
		() => ({
			isVisible: state.isVisible,
			position: state.position,
			items: state.items,
			handleContextMenu,
			hideMenu
		}),
		[state.isVisible, state.position, state.items, handleContextMenu, hideMenu]
	);
};
