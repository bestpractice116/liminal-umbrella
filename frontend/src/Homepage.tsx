import List from 'antd/es/list';
import { Link } from 'react-router-dom';
import Button from 'antd/es/button';
import { useContext } from 'react';
import { AuthData, isAuthenticated, isDM } from './Auth';
import { DebugContext } from './Debug';
import './App.css';

function HomePage() {
	const { debug } = useContext(DebugContext);
	const auth = isAuthenticated();
	const dm = isDM();
	return (
		<>
			<div>
				<div className="card">
					{debug ? <AuthData /> : <></>}
					Welcome {auth.user.nickname} to the Preston RPG Discord bot!
					<br />
					Please see the menus at the top to find your way around.
				</div>
				{dm ? (
					<>
						<Link to={`./dm/newgame`} relative="path">
							<Button type="primary" style={{ marginBottom: 16 }}>
								Create new game
							</Button>
						</Link>
						<Link to={`./dm/viewgames`} relative="path">
							<Button type="primary" style={{ marginBottom: 16 }}>
								View games
							</Button>
						</Link>
					</>
				) : (
					<></>
				)}
				<List header={<div>Your Roles:</div>} bordered dataSource={auth.roles} renderItem={(item: string) => <List.Item>{item}</List.Item>} />
			</div>
		</>
	);
}

export default HomePage;
