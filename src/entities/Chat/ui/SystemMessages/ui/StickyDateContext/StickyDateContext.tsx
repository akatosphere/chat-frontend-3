'use client';

import React, {
	createContext,
	useContext,
	useRef,
	useEffect,
	useCallback
} from 'react';
import StickyDateHeader from '../StickyDateHeader/StickyDateHeader';
import { useStickyDate } from '@/entities/Chat/model/lib/hooks/useStickyDate/useStickyDate';

import cls from './StickyDateContext.module.scss';

interface StickyDateContextValue {
	activeDate: Date | null;
	registerSeparator: (id: string, date: Date, element: HTMLElement) => void;
	unregisterSeparator: (id: string) => void;
	isActive: (id: string) => boolean;
	isHidden: (id: string) => boolean;
}

const StickyDateContext = createContext<StickyDateContextValue | undefined>(
	undefined
);

export const StickyDateProvider: React.FC<{
	children: React.ReactNode;
	containerRef?: React.RefObject<HTMLDivElement>;
	onScrollContainerReady?: (container: HTMLDivElement | null) => void;
}> = ({
	children,
	containerRef: externalContainerRef,
	onScrollContainerReady
}) => {
	// ─────────────────────────────────────────────────────────────
	// Рефы: разделение ответственности
	// ─────────────────────────────────────────────────────────────

	// Контейнер для позиционирования (может быть внешним)
	const internalContainerRef = useRef<HTMLDivElement>(null);
	const containerRef = externalContainerRef || internalContainerRef;

	// Скролл-контейнер (всегда внутренний, на него вешается логика)
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// ─────────────────────────────────────────────────────────────
	// Делегируем всю логику хуку
	// ─────────────────────────────────────────────────────────────

	const { activeDate, register, unregister, isActive, isHidden } =
		useStickyDate({
			containerRef: scrollContainerRef,
			offsetTop: 10,
			tolerance: 20
		});

	// ─────────────────────────────────────────────────────────────
	// Callback для родителя (например, MessagesList)
	// ─────────────────────────────────────────────────────────────

	useEffect(() => {
		if (onScrollContainerReady && scrollContainerRef.current) {
			onScrollContainerReady(scrollContainerRef.current);
		}
	}, [onScrollContainerReady]);

	// ─────────────────────────────────────────────────────────────
	// Реф-коллбэк для скролл-контейнера
	// ─────────────────────────────────────────────────────────────

	const handleScrollContainerRef = useCallback(
		(node: HTMLDivElement | null) => {
			scrollContainerRef.current = node;
		},
		[]
	);

	// ─────────────────────────────────────────────────────────────
	// Значение контекста (без isAtBottom!)
	// ─────────────────────────────────────────────────────────────

	const value: StickyDateContextValue = {
		activeDate,
		registerSeparator: register,
		unregisterSeparator: unregister,
		isActive,
		isHidden
	};

	// ─────────────────────────────────────────────────────────────
	// Рендер
	// ─────────────────────────────────────────────────────────────

	return (
		<StickyDateContext.Provider value={value}>
			<div ref={containerRef} className={cls.stickyDateProvider}>
				<StickyDateHeader date={activeDate} isVisible={activeDate !== null} />

				<div
					ref={handleScrollContainerRef}
					className={cls.scrollContainer}
					data-scroll-container
				>
					{children}
				</div>
			</div>
		</StickyDateContext.Provider>
	);
};

export const useStickyDateContext = () => {
	const context = useContext(StickyDateContext);
	if (!context) {
		throw new Error(
			'useStickyDateContext must be used within StickyDateProvider'
		);
	}
	return context;
};
