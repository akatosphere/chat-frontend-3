import { Container } from '@/shared/ui/Container/ui/Container';
import { Navbar } from '@/widgets/Navbar';
import cls from './layout.module.scss';

export default function MainLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<Container>
			<div className={cls.mainLayout}>
				<Navbar />
				<main className={cls.content}>{children}</main>
			</div>
		</Container>
	);
}
