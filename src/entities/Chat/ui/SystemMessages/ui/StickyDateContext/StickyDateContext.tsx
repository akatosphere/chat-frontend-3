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
	scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
	onScrollContainerReady?: (container: HTMLDivElement | null) => void;
}> = ({
	children,
	containerRef: externalContainerRef,
	scrollContainerRef: externalScrollRef,
	onScrollContainerReady
}) => {
	const internalContainerRef = useRef<HTMLDivElement>(null);
	const internalScrollRef = useRef<HTMLDivElement>(null);

	const effectiveScrollRef = externalScrollRef || internalScrollRef;
	const containerRef = externalContainerRef || internalContainerRef;

	const { activeDate, register, unregister, isActive, isHidden } =
		useStickyDate({
			scrollContainerRef: effectiveScrollRef,
			offsetTop: 10,
			tolerance: 20
		});
	// ─────────────────────────────────────────────────────────────

	useEffect(() => {
		if (onScrollContainerReady && effectiveScrollRef.current) {
			onScrollContainerReady(effectiveScrollRef.current);
		}
	}, [onScrollContainerReady, effectiveScrollRef]);
	// ─────────────────────────────────────────────────────────────

	const handleScrollContainerRef = useCallback(
		(node: HTMLDivElement | null) => {
			internalScrollRef.current = node;
		},
		[]
	);
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
			<div
				ref={containerRef}
				className={cls.stickyDateProvider}
				style={{ position: 'relative' }}
			>
				<StickyDateHeader date={activeDate} isVisible={activeDate !== null} />

				{externalScrollRef ? (
					<>{children}</>
				) : (
					<div
						ref={handleScrollContainerRef}
						className={cls.scrollContainer}
						data-scroll-container
					>
						{children}
					</div>
				)}
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
