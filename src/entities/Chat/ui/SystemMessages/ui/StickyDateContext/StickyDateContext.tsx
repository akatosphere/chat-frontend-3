'use client';

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	useEffect
} from 'react';
import StickyDateHeader from '../StickyDateHeader/StickyDateHeader';
import cls from './StickyDateContext.module.scss';

interface SeparatorInfo {
	id: string;
	date: Date;
	element: HTMLElement;
}

interface StickyDateContextValue {
	registerSeparator: (id: string, date: Date, element: HTMLElement) => void;
	unregisterSeparator: (id: string) => void;
	activeDate: Date | null;
	isActive: (id: string) => boolean;
	isHidden: (id: string) => boolean;
}

const StickyDateContext = createContext<StickyDateContextValue | undefined>(
	undefined
);

const STICKY_OFFSET_TOP = 10;
const STICKY_TOLERANCE = 20; // Допуск для раннего переключения

export const StickyDateProvider: React.FC<{
	children: React.ReactNode;
	containerRef?: React.RefObject<HTMLDivElement>;
}> = ({ children, containerRef: externalContainerRef }) => {
	const [activeDate, setActiveDate] = useState<Date | null>(null);
	const [activeSeparatorId, setActiveSeparatorId] = useState<string | null>(
		null
	);
	const separatorsRef = useRef<Map<string, SeparatorInfo>>(new Map());
	const internalContainerRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [hiddenSeparatorIds, setHiddenSeparatorIds] = useState<Set<string>>(
		new Set()
	);

	const containerRef = externalContainerRef || internalContainerRef;

	const registerSeparator = useCallback(
		(id: string, date: Date, element: HTMLElement) => {
			separatorsRef.current.set(id, { id, date, element });
		},
		[]
	);

	const unregisterSeparator = useCallback((id: string) => {
		separatorsRef.current.delete(id);
		setHiddenSeparatorIds(prev => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
	}, []);

	const isActive = useCallback(
		(id: string) => id === activeSeparatorId,
		[activeSeparatorId]
	);

	const isHidden = useCallback(
		(id: string) => {
			return hiddenSeparatorIds.has(id);
		},
		[hiddenSeparatorIds]
	);

	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		if (!scrollContainer) {
			return;
		}

		const findActiveSeparator = () => {
			if (separatorsRef.current.size === 0) {
				return null;
			}

			const containerRect = scrollContainer.getBoundingClientRect();
			const threshold = containerRect.top + STICKY_OFFSET_TOP;

			let bestMatch: SeparatorInfo | null = null;
			let maxTopBelowThreshold = -Infinity;
			const newHiddenSet = new Set<string>();

			for (const sep of separatorsRef.current.values()) {
				if (!sep.element.isConnected) {
					continue;
				}

				const rect = sep.element.getBoundingClientRect();

				if (
					rect.top <= threshold + STICKY_TOLERANCE &&
					rect.top > maxTopBelowThreshold
				) {
					maxTopBelowThreshold = rect.top;
					bestMatch = sep;
				}

				if (rect.bottom < threshold) {
					newHiddenSet.add(sep.id);
				}
			}

			setHiddenSeparatorIds(prev => {
				if (prev.size !== newHiddenSet.size) {
					return newHiddenSet;
				}

				for (const id of newHiddenSet) {
					if (!prev.has(id)) {
						return newHiddenSet;
					}
				}

				for (const id of prev) {
					if (!newHiddenSet.has(id)) {
						return newHiddenSet;
					}
				}

				return prev;
			});

			if (!bestMatch) {
				const first = Array.from(separatorsRef.current.values())
					.filter(s => s.element.isConnected)
					.sort(
						(a, b) =>
							a.element.getBoundingClientRect().top -
							b.element.getBoundingClientRect().top
					)[0];
				return first || null;
			}

			return bestMatch;
		};

		const handleScroll = () => {
			requestAnimationFrame(() => {
				const active = findActiveSeparator();

				if (active?.date) {
					setActiveDate(prev =>
						prev?.getTime() === active.date.getTime() ? prev : active.date
					);
				}
				if (active?.id) {
					setActiveSeparatorId(prev => (prev === active.id ? prev : active.id));
				}
			});
		};

		scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
		const initTimer = setTimeout(handleScroll, 0);

		return () => {
			clearTimeout(initTimer);
			scrollContainer.removeEventListener('scroll', handleScroll);
		};
	}, []);

	const value: StickyDateContextValue = {
		registerSeparator,
		unregisterSeparator,
		activeDate,
		isActive,
		isHidden
	};

	return (
		<StickyDateContext.Provider value={value}>
			<div ref={containerRef} className={cls.stickyDateProvider}>
				<StickyDateHeader date={activeDate} isVisible={activeDate !== null} />
				<div ref={scrollContainerRef} className={cls.scrollContainer}>
					{children}
				</div>
			</div>
		</StickyDateContext.Provider>
	);
};

export const useStickyDate = () => {
	const context = useContext(StickyDateContext);
	if (!context) {
		throw new Error('useStickyDate must be used within StickyDateProvider');
	}
	return context;
};
