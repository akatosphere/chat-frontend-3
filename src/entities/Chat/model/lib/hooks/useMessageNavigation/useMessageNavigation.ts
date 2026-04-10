import { useCallback, useRef, RefObject, useEffect } from 'react';
import { MESSAGE_HIGHLIGHT_DURATION } from '@/shared/model';

interface UseMessageNavigationOptions {
	scrollContainerRef: RefObject<HTMLDivElement | null>;
	activeClass?: string;
}

export const useMessageNavigation = ({
	scrollContainerRef,
	activeClass = ''
}: UseMessageNavigationOptions) => {
	const highlightTimeoutRef = useRef<NodeJS.Timeout>(null);
	const retryCountRef = useRef(0);
	const MAX_RETRIES = 3;

	const navigateToMessage = useCallback(
		(messageId: string) => {
			const scrollToElement = () => {
				const messageEl = document.querySelector(
					`[data-message-id="${messageId}"]`
				) as HTMLElement;
				const container = scrollContainerRef.current;

				if (!container && retryCountRef.current < MAX_RETRIES) {
					retryCountRef.current += 1;
					requestAnimationFrame(scrollToElement);
					return;
				}

				if (!messageEl || !container) {
					retryCountRef.current = 0;
					return;
				}

				retryCountRef.current = 0;

				messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

				if (activeClass) {
					messageEl.classList.add(activeClass);
					if (highlightTimeoutRef.current) {
						clearTimeout(highlightTimeoutRef.current);
					}
					highlightTimeoutRef.current = setTimeout(() => {
						messageEl.classList.remove(activeClass);
					}, MESSAGE_HIGHLIGHT_DURATION);
				}

				if (messageEl instanceof HTMLElement) {
					messageEl.setAttribute('tabindex', '-1');
					messageEl.focus({ preventScroll: true });
				}
			};

			requestAnimationFrame(() => {
				requestAnimationFrame(scrollToElement);
			});
		},
		[scrollContainerRef, activeClass]
	);

	useEffect(() => {
		return () => {
			if (highlightTimeoutRef.current) {
				clearTimeout(highlightTimeoutRef.current);
			}
		};
	}, []);

	return { navigateToMessage };
};
