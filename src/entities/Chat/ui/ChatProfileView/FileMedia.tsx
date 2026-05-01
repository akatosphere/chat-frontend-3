import s from './ChatProfileView.module.scss';
import { FileIcon } from './ui/icons/FileIcon';

interface FileMediaProps {
	filename: string;
	size: string;
	date: string;
	className?: string;
	loading?: boolean;
}

export const FileMedia = ({
	filename,
	size,
	date,
	className = '',
	loading = false
}: FileMediaProps) => {
	return (
		<div className={`${s.fileMedia} ${className}`}>
			<div className={s.content}>
				<div className={s.iconWrapper}>
					<FileIcon loading={loading} />
				</div>

				<div className={s.info}>
					<p className={s.filename}>{filename}</p>
					<p className={s.meta}>
						{size} • {date}
					</p>
				</div>
			</div>
		</div>
	);
};
