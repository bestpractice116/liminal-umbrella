import { AnyObject } from 'antd/es/_util/type';
import { TopMenu } from './TopMenu';
import Layout, { Footer, Content } from 'antd/es/layout/layout';
import { checkIsMobile } from '../../lib';
import { AuthLoadingSpinner } from '../Auth';

export function Page({ children }: { children: React.ReactNode }) {
	const isMobile = checkIsMobile();
	const style: AnyObject = {
		minHeight: 280,
		paddingLeft: 0,
		margin: isMobile ? 0 : '2em'
	};
	if (isMobile) {
		style.width = '100%';
	}
	return (
		<Layout style={style}>
			<TopMenu />
			<Content>
				<div
					style={{
						minHeight: 280,
						padding: isMobile ? 0 : '2em'
					}}
				>
					<AuthLoadingSpinner>{children}</AuthLoadingSpinner>
				</div>
			</Content>
			<Footer style={{ textAlign: 'center' }}>Preston RPG Discord Admins ©{new Date().getFullYear()} built with ❤️ by Tomas D</Footer>
		</Layout>
	);
}
