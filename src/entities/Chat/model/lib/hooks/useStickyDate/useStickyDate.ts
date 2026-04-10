import { useCallback, useEffect, useRef, useState } from 'react';

export interface SeparatorInfo {
	id: string;
	date: Date;
	element: HTMLElement;
}

export interface UseStickyDateOptions {
	containerRef: React.RefObject<HTMLDivElement | null>;
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
	containerRef,
	offsetTop = DEFAULT_OFFSET_TOP,
	tolerance = DEFAULT_TOLERANCE
}: UseStickyDateOptions): UseStickyDateReturn => {
	const [activeDate, setActiveDate] = useState<Date | null>(null);
	const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

	const separatorsRef = useRef<Map<string, SeparatorInfo>>(new Map());
	const sortedSeparatorsRef = useRef<SeparatorInfo[]>([]);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const activeIdRef = useRef<string | null>(null);
	const isMountedRef = useRef(false);

	const register = useCallback(
		(id: string, date: Date, element: HTMLElement) => {
			const info: SeparatorInfo = { id, date, element };
			separatorsRef.current.set(id, info);

			sortedSeparatorsRef.current = Array.from(separatorsRef.current.values())
				.filter(s => s.element.isConnected)
				.sort((a, b) => {
					const aRect = a.element.getBoundingClientRect();
					const bRect = b.element.getBoundingClientRect();
					return aRect.top - bRect.top;
				});
		},
		[]
	);

	const unregister = useCallback((id: string) => {
		separatorsRef.current.delete(id);
		sortedSeparatorsRef.current = sortedSeparatorsRef.current.filter(
			s => s.id !== id
		);

		setHiddenIds(prev => {
			if (!prev.has(id)) {
				return prev;
			}
			const next = new Set(prev);
			next.delete(id);
			return next;
		});

		if (activeIdRef.current === id) {
			activeIdRef.current = null;
			setActiveDate(null);
		}
	}, []);

	const isActive = useCallback((id: string) => id === activeIdRef.current, []);
	const isHidden = useCallback((id: string) => hiddenIds.has(id), [hiddenIds]);

	const updateActiveSeparator = useCallback(() => {
		if (!containerRef) {
			return;
		}
		const container = containerRef.current;
		if (!container || sortedSeparatorsRef.current.length === 0) {
			return;
		}

		const containerRect = container.getBoundingClientRect();
		const threshold = containerRect.top + offsetTop;

		let active: SeparatorInfo | null = null;

		for (const sep of sortedSeparatorsRef.current) {
			if (!sep.element.isConnected) {
				continue;
			}

			const rect = sep.element.getBoundingClientRect();

			if (
				rect.top <= threshold + tolerance &&
				rect.top > threshold - rect.height
			) {
				active = sep;
				break;
			}
		}

		if (active?.id !== activeIdRef.current) {
			activeIdRef.current = active?.id ?? null;

			requestAnimationFrame(() => {
				if (isMountedRef.current) {
					setActiveDate(active?.date ?? null);
				}
			});
		}

		const newHidden = new Set<string>();
		for (const sep of sortedSeparatorsRef.current) {
			if (!sep.element.isConnected) {
				continue;
			}
			const rect = sep.element.getBoundingClientRect();
			if (rect.bottom < threshold) {
				newHidden.add(sep.id);
			}
		}

		setHiddenIds(prev => {
			if (
				prev.size === newHidden.size &&
				[...prev].every(id => newHidden.has(id))
			) {
				return prev;
			}
			return newHidden;
		});
	}, [containerRef, offsetTop, tolerance]);

	useEffect(() => {
		if (!containerRef) {
			return;
		}
		isMountedRef.current = true;

		const container = containerRef.current;
		if (!container) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				requestIdleCallback(
					() => {
						if (isMountedRef.current) {
							updateActiveSeparator();
						}
					},
					{ timeout: 16 }
				);
			},
			{
				root: container,
				threshold: [0, 0.1, 0.5, 1.0],
				rootMargin: `-${offsetTop}px 0px 0px 0px`
			}
		);

		separatorsRef.current.forEach(({ element }) => {
			if (element.isConnected) {
				observer.observe(element);
			}
		});

		requestAnimationFrame(() => {
			if (isMountedRef.current) {
				updateActiveSeparator();
			}
		});

		observerRef.current = observer;

		return () => {
			isMountedRef.current = false;
			observer.disconnect();
			observerRef.current = null;
		};
	}, [containerRef, offsetTop, updateActiveSeparator]);

	useEffect(() => {
		if (observerRef.current) {
			observerRef.current.disconnect();
			separatorsRef.current.forEach(({ element }) => {
				if (element.isConnected) {
					observerRef.current?.observe(element);
				}
			});

			requestAnimationFrame(() => {
				if (isMountedRef.current) {
					updateActiveSeparator();
				}
			});
		}
	}, [separatorsRef, updateActiveSeparator]);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return {
		activeDate,
		register,
		unregister,
		isActive,
		isHidden
	};
};
