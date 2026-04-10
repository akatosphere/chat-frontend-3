'use client';

import { forwardRef, memo, useCallback, useMemo } from 'react';
import { SearchIcon, Close, ShevronUp, ShevronDown } from '@icons/index';
import {
	Button,
	ButtonColor,
	ButtonTheme,
	ButtonType
} from '@/shared/ui/Button';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './Search.module.scss';

// '@/shared/ui/Search/Search.tsx'

export interface SearchProps extends Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'onChange' | 'ref'
> {
	className?: string;
	inputRef?: React.Ref<HTMLInputElement>;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	inputClassName?: string;
	disableClear?: boolean;
	showIcon?: boolean;
	alwaysShowClear?: boolean;
	onClear?: (currentValue: string) => void;

	//  Новые пропсы для навигации по результатам поиска
	showNavigation?: boolean;
	onNavigatePrev?: () => void;
	onNavigateNext?: () => void;
	searchResultsCount?: number;
	activeResultIndex?: number;
	canGoPrev?: boolean;
	canGoNext?: boolean;
}

export const Search = memo(
	forwardRef<HTMLInputElement, SearchProps>(
		(
			{
				value,
				onChange,
				placeholder = 'Поиск...',
				className = '',
				inputClassName = '',
				inputRef,
				disableClear = false,
				showIcon = true,
				alwaysShowClear = false,
				onClear,
				onKeyDown,
				showNavigation = false,
				onNavigatePrev,
				onNavigateNext,
				searchResultsCount = 0,
				activeResultIndex = 0,
				canGoPrev = true,
				canGoNext = true,
				...inputProps
			},
			ref
		) => {
			const hasValue = useMemo(() => value.trim().length > 0, [value]);

			const showClearButton = useMemo(() => {
				if (disableClear) {
					return false;
				}
				if (alwaysShowClear) {
					return true;
				}
				return hasValue;
			}, [disableClear, alwaysShowClear, hasValue]);

			const showNavButtons = showNavigation && searchResultsCount > 0;

			const handleClear = useCallback(() => {
				onClear?.(value);
				if (hasValue) {
					onChange('');
				}
			}, [hasValue, onChange, onClear, value]);

			const handleKeyDown = useCallback(
				(e: React.KeyboardEvent<HTMLInputElement>) => {
					if (e.key === 'Escape') {
						if (value.trim().length > 0) {
							onChange('');
						} else {
							onClear?.(value);
						}
						e.currentTarget.blur();
					}
					onKeyDown?.(e);
				},
				[onChange, onClear, onKeyDown, value]
			);

			const handleChange = useCallback(
				(e: React.ChangeEvent<HTMLInputElement>) => {
					onChange(e.target.value);
				},
				[onChange]
			);

			const inputClass = classNames(cls.input, {}, [inputClassName]);

			return (
				<div
					className={classNames(
						cls.container,
						{
							[cls.alwaysShowClear]: alwaysShowClear,
							[cls.withNavigation]: showNavButtons
						},
						[className]
					)}
					role='search'
					aria-label='Поле поиска'
				>
					{showIcon && (
						<SearchIcon className={cls.searchIcon} aria-hidden='true' />
					)}

					<input
						ref={ref || inputRef}
						name='search'
						type='text'
						value={value}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className={inputClass}
						aria-label={placeholder}
						autoComplete='search'
						spellCheck={false}
						{...inputProps}
					/>

					<div className={cls.rightButtons}>
						{showNavButtons && (
							<div className={cls.navButtons}>
								<button
									type='button'
									onClick={onNavigatePrev}
									aria-label={`Предыдущий результат (${activeResultIndex + 1} из ${searchResultsCount})`}
									title={`↑ Предыдущий (${activeResultIndex + 1}/${searchResultsCount})`}
									disabled={!canGoPrev}
									className={classNames(cls.navButton, {
										[cls.navButtonDisabled]: !canGoPrev
									})}
								>
									<ShevronUp
										className={classNames(cls.icon, {
											[cls.iconDisabled]: !canGoPrev
										})}
									/>
								</button>

								<button
									type='button'
									onClick={onNavigateNext}
									aria-label={`Следующий результат (${activeResultIndex + 1} из ${searchResultsCount})`}
									title={`↓ Следующий (${activeResultIndex + 1}/${searchResultsCount})`}
									className={classNames(cls.navButton, {
										[cls.navButtonDisabled]: !canGoNext
									})}
									disabled={!canGoNext}
								>
									<ShevronDown
										className={classNames(cls.icon, {
											[cls.iconDisabled]: !canGoNext
										})}
									/>
								</button>
							</div>
						)}

						{showClearButton && (
							<Button
								btnType={ButtonType.BUTTON}
								color={ButtonColor.TRANSPARENT}
								theme={ButtonTheme.CLEAR}
								onClick={handleClear}
								className={cls.clearButton}
								aria-label={hasValue ? 'Очистить поиск' : 'Закрыть поиск'}
							>
								<Close className={cls.closeIcon} aria-hidden='true' />
							</Button>
						)}
					</div>
				</div>
			);
		}
	)
);

Search.displayName = 'Search';
