'use client';

import { classNames } from '@/shared/lib/classNames/classNames';
import { filterContacts, Search, useLocalSearch } from '@/shared/ui/Search';
import { UserCardSkeleton } from '@/shared/ui/Skeleton';
import { Text } from '@/shared/ui/Text';
import {
	mapBlackListToUserCard,
	UserCard,
	UserCardType
} from '@/shared/ui/UserCard';
import Image from 'next/image';
import {
	useDeleteBlackListMutation,
	useGetBlackListQuery
} from '../api/blackListApi';
import { logger } from '@/shared/lib/logger/logger';

import cls from './BlackList.module.scss';

interface BlackListProps {
	className?: string;
}

export const BlackList = ({ className }: BlackListProps) => {
	const {
		isLoading,
		data: blackListData,
		error,
		refetch
	} = useGetBlackListQuery();

	const [deleteBlackList] = useDeleteBlackListMutation();

	const { searchTerm, handleSearchChange, filteredData } = useLocalSearch(
		blackListData || [],
		filterContacts
	);

	const onDeleteHandler = async (uid: string) => {
		if (!uid) {
			logger.error('onDeleteHandler: uid is undefined', {
				category: 'ui',
				prefix: 'blacklist'
			});
			return;
		}
		try {
			await deleteBlackList(uid).unwrap();
			refetch();
		} catch (err: unknown) {
			logger.error('Failed to delete from blacklist', {
				category: 'api',
				prefix: err instanceof Error ? err.message : String(err)
			});
		}
	};

	if (error) {
		return (
			<div className={classNames(cls.blackList, {}, [className])}>
				<Text>Произошла ошибка, попробуйте перезагрузить страницу</Text>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div
				className={classNames(cls.blackListContainer, {}, [
					className,
					cls.blackListSkeleton
				])}
			>
				<UserCardSkeleton type={UserCardType.BLACK_LIST} count={10} />
			</div>
		);
	}

	if (!blackListData?.length || (searchTerm && !filteredData?.length)) {
		return (
			<div className={classNames(cls.blackListEmpty, {}, [className])}>
				<Image
					src='/images/png/emptyBlackList.png'
					alt='Список пуст'
					className={cls.emptyImage}
					width={200}
					height={200}
				/>
				<Text>{searchTerm ? 'Ничего не найдено' : 'Список пока пуст'}</Text>
			</div>
		);
	}

	const displayData = searchTerm ? filteredData : blackListData;

	return (
		<div className={classNames(cls.blackList, {}, [className])}>
			<Search
				value={searchTerm}
				onChange={handleSearchChange}
				placeholder='Поиск в чёрном списке...'
			/>

			<div className={cls.blackListContainer}>
				{displayData?.map(item => (
					<UserCard
						key={item.uid}
						type={UserCardType.BLACK_LIST}
						userData={mapBlackListToUserCard(item)}
						onDelete={() => onDeleteHandler(item.uid)}
					/>
				))}
			</div>
		</div>
	);
};
