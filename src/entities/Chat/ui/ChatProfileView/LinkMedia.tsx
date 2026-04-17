import s from './ChatProfileView.module.scss';

interface LinkMediaProps {
	url: string;
	name: string;
	createdAt: string;
	className?: string;
}

export const LinkMedia = ({
	url,
	name,
	createdAt,
	className
}: LinkMediaProps) => {
	const domain = new URL(url).hostname;

	return (
		<div className={s.linksMedia}>
			<div className={s.icon}>{domain[0]}</div>

			<div className={s.content}>
				<p className={s.domain}>{domain}</p>

				<a className={s.link} href={url}>
					{url}
				</a>

				<p className={s.meta}>
					{name} • {createdAt}
				</p>
			</div>
		</div>
	);
};
