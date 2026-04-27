import { logger } from '@/shared/lib/logger/logger';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SeparatorInfo {
	id: string;
	date: Date;
	element: HTMLElement;
}

export interface UseStickyDateOptions {
	scrollContainerRef: React.RefObject<HTMLDivElement | null>;
	offsetTop?: number;
	tolerance?: number;
}

export interface UseStickyDateReturn {
	activeDate: Date | null;
	register: (id: string, date: Date, element: HTMLElement) => void;
	unregister: (id: string) => void;
	isActive: (id: string) => boolean;
	isHidden: (id: string) => boolean;
}

const DEFAULT_OFFSET_TOP = 10;
const DEFAULT_TOLERANCE = 20;

export const useStickyDate = ({
	scrollContainerRef,
	offsetTop = DEFAULT_OFFSET_TOP,
	tolerance = DEFAULT_TOLERANCE
}: UseStickyDateOptions): UseStickyDateReturn => {
	const [activeDate, setActiveDate] = useState<Date | null>(null);
	const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

	const separatorsRef = useRef<Map<string, SeparatorInfo>>(new Map());
	const activeIdRef = useRef<string | null>(null);
	const isMountedRef = useRef(false);
	const rafRef = useRef<number | null>(null);

	const updateActiveSeparator = useCallback(() => {
		const container = scrollContainerRef.current;
		if (!container || separatorsRef.current.size === 0) {
			return;
		}

		const containerRect = container.getBoundingClientRect();
		const threshold = containerRect.top + offsetTop;

		let active: SeparatorInfo | null = null;
		let maxTop = -Infinity;

		for (const sep of separatorsRef.current.values()) {
			if (!sep.element.isConnected) {
				continue;
			}

			const rect = sep.element.getBoundingClientRect();

			if (rect.top <= threshold + tolerance && rect.top > maxTop) {
				maxTop = rect.top;
				active = sep;
			}
		}

		if (active && active.id !== activeIdRef.current) {
			activeIdRef.current = active.id;
			requestAnimationFrame(() => {
				if (isMountedRef.current) {
					setActiveDate(active.date);
				}
			});
		}

		const newHidden = activeIdRef.current
			? new Set([activeIdRef.current])
			: new Set<string>();

		setHiddenIds(prev => {
			if (
				prev.size === newHidden.size &&
				[...prev].every(id => newHidden.has(id))
			) {
				return prev;
			}
			return newHidden;
		});
	}, [scrollContainerRef, offsetTop, tolerance]);

	const handleScroll = useCallback(() => {
		if (!isMountedRef.current) {
			return;
		}

		if (rafRef.current) {
			return;
		}
		rafRef.current = requestAnimationFrame(() => {
			if (isMountedRef.current) {
				updateActiveSeparator();
			}
			rafRef.current = null;
		});
	}, [updateActiveSeparator]);

	const register = useCallback(
		(id: string, date: Date, element: HTMLElement) => {
			separatorsRef.current.set(id, { id, date, element });

			requestAnimationFrame(() => {
				if (isMountedRef.current) {
					updateActiveSeparator();
				}
			});
		},
		[updateActiveSeparator]
	);

	const unregister = useCallback(
		(id: string) => {
			separatorsRef.current.delete(id);

			requestAnimationFrame(() => {
				if (isMountedRef.current) {
					updateActiveSeparator();
				}
			});
		},
		[updateActiveSeparator]
	);

	const isActive = useCallback((id: string) => id === activeIdRef.current, []);
	const isHidden = useCallback((id: string) => hiddenIds.has(id), [hiddenIds]);

	useEffect(() => {
		const targetEl = scrollContainerRef.current;

		if (!targetEl) {
			logger.warn('[useStickyDate] Scroll container not found!');
			return;
		}

		isMountedRef.current = true;

		targetEl.addEventListener('scroll', handleScroll, { passive: true });

		requestAnimationFrame(() => {
			if (isMountedRef.current) {
				updateActiveSeparator();
			}
		});

		return () => {
			isMountedRef.current = false;
			targetEl.removeEventListener('scroll', handleScroll);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [scrollContainerRef, handleScroll, updateActiveSeparator]);

	useEffect(() => {
		const handleResize = () => updateActiveSeparator();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [updateActiveSeparator]);

	return {
		activeDate,
		register,
		unregister,
		isActive,
		isHidden
	};
};
