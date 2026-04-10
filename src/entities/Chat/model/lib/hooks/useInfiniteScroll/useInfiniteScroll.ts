import { useRef, useState, useCallback, useEffect } from 'react';
import {
	UseInfiniteScrollOptions,
	UseInfiniteScrollReturn
} from '../../../types/chat.types/chat.types';

export const useInfiniteScroll = ({
	loadMore,
	onBottomChange,
	threshold = 50,
	loadThreshold = 50
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const anchorRef = useRef<HTMLDivElement>(null);
	const isAtBottomRef = useRef(true);
	const isLoadingRef = useRef(false);

	const [isAtBottom, setIsAtBottom] = useState(true);
	const [newCount, setNewCount] = useState(0);

	const getScrollContainer = useCallback(() => {
		return scrollRef.current;
	}, []);

	const checkIsAtBottom = useCallback(
		(el: HTMLDivElement): boolean => {
			const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
			return distance < threshold;
		},
		[threshold]
	);

	const handleScroll = useCallback(() => {
		const el = getScrollContainer();
		if (!el) {
			return;
		}

		const isBottom = checkIsAtBottom(el);

		if (isAtBottomRef.current !== isBottom) {
			isAtBottomRef.current = isBottom;
			setIsAtBottom(isBottom);
			onBottomChange?.(isBottom);
		}

		if (isBottom && newCount > 0) {
			setNewCount(0);
		}

		if (el.scrollTop < loadThreshold && !isLoadingRef.current) {
			void loadMore();
		}
	}, [
		getScrollContainer,
		checkIsAtBottom,
		onBottomChange,
		newCount,
		loadMore,
		loadThreshold
	]);

	const scrollToBottom = useCallback(() => {
		anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		setNewCount(0);
	}, []);

	const resetNewCount = useCallback(() => setNewCount(0), []);
	const incrementNewCount = useCallback(() => setNewCount(c => c + 1), []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) {
			return;
		}

		el.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();
		return () => el.removeEventListener('scroll', handleScroll);
	}, [handleScroll]);

	useEffect(() => {
		isLoadingRef.current = false;
	}, [loadMore]);

	return {
		scrollRef,
		anchorRef,
		isAtBottom,
		newCount,
		scrollToBottom,
		resetNewCount,
		incrementNewCount
	};
};
