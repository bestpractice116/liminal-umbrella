import { useAuthStatus, LoginButton } from '../../components/Auth';
import { Navigate } from 'react-router-dom';

export function Login() {
	const { isAuthenticated } = useAuthStatus();
	if (isAuthenticated()) {
		return <Navigate to={'/'} replace />;
	}
	return (
		<div style={{ margin: 'auto' }}>
			<div style={{ margin: 'auto', textAlign: 'center' }}>Log in with Discord:</div>
			<div style={{ margin: 'auto', textAlign: 'center' }}>
				<LoginButton />
			</div>
		</div>
	);
}
