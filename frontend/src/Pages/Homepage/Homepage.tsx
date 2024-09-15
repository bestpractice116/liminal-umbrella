import List from 'antd/es/list';
import { Link } from 'react-router-dom';
import Button from 'antd/es/button';
import Flex from 'antd/es/flex';
import Space from 'antd/es/space';
import { useContext } from 'react';
import { AuthData, useAuthStatus } from '../../components/Auth';
import { DebugContext } from '../../Debug';
import { Tooltip } from '../../components/Tooltip';

export function HomePage() {
	const { debug } = useContext(DebugContext);
	const { isAuthenticated, isDM } = useAuthStatus();
	const auth = isAuthenticated();
	const dm = isDM();
	return (
		<>
			<div>
				<div className="card">
					{debug ? <AuthData /> : <></>}
					Welcome {auth.user.nickname} to the Preston RPG Discord bot!
				</div>
				{dm ? (
					<Flex justify="center">
						<Space>
							<Tooltip messageKey="NEW_GAME_TOOLTIP">
								<Link to={`./dm/newgame`} relative="path">
									<Button type="primary" style={{ marginBottom: 16 }}>
										Create new game
									</Button>
								</Link>
							</Tooltip>
							<Tooltip messageKey="VIEW_GAMES_TOOLTIP">
								<Link to={`./dm/viewgames`} relative="path">
									<Button type="primary" style={{ marginBottom: 16 }}>
										View games
									</Button>
								</Link>
							</Tooltip>
						</Space>
					</Flex>
				) : (
					<></>
				)}
				<List header={<div>Your Roles:</div>} bordered dataSource={auth.roles} renderItem={(item: string) => <List.Item>{item}</List.Item>} />
			</div>
		</>
	);
}
