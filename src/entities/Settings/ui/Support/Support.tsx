import { SettingsHeaderBlock } from '@/entities/Settings';
import { SupportForm } from '@/features/support';
import styles from './Support.module.scss';

export function Support() {
	return (
		<section className={styles.support}>
			<SettingsHeaderBlock
				title={'Обращение в поддержку'}
				href={'/settings'}
				parentClass={styles.headerBlock}
			/>
			<SupportForm parentClass={styles.form} marginTop='341px' />
		</section>
	);
}
