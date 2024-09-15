import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { createContext, useContext } from 'react';
import { Button } from 'antd';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { AuthFetchResult, LogoutFetchResult } from './types';

async function fetchAuth(): Promise<AuthFetchResult> {
	return fetch(
		'/oauth/refreshtoken',
		{
			method: 'POST'
		},
		FetchResultTypes.JSON
	);
}

async function doLogoutCallback(): Promise<LogoutFetchResult> {
	return fetch(
		'/oauth/logout',
		{
			method: 'POST',
			body: JSON.stringify({}),
			headers: {
				'Content-Type': 'application/json'
			}
		},
		FetchResultTypes.JSON
	);
}

export function useLogoutMutation() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: doLogoutCallback,
		onSuccess: (_) => {
			queryClient.setQueryData(['auth'], { error: 'Unauthorized' });
			navigate('/login', { replace: true, state: { redirectTo: '/' } });
		}
	});
	return {
		logoutMutation: () => {
			mutation.mutate();
		}
	};
}

export function LoginButton() {
	const location = useLocation();
	const { isAuthenticated } = useAuthStatus();
	if (isAuthenticated()) {
		return null;
	}
	const redirectTo = location.state?.redirectTo || '/';
	let returnTo: string = '/';
	if (redirectTo) {
		returnTo = redirectTo;
	}
	if (redirectTo === '/login') {
		returnTo = '/';
	}
	sessionStorage.setItem('beforeLogin', returnTo);
	return (
		<Button type="primary" onClick={doAuthRedirect} className="login-form-button">
			Login
		</Button>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthContext = createContext(null as any);
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const result = useQuery({ queryKey: ['auth'], queryFn: fetchAuth, notifyOnChangeProps: 'all', retry: 0 });
	return <AuthContext.Provider value={result}>{children}</AuthContext.Provider>;
}

export function useAuthStatus() {
	const auth = useContext(AuthContext);
	const isAuthenticated = () => {
		if (!auth || auth.isFetching || auth.isError || !auth.data || auth.data.error) {
			return false;
		}
		return auth.data;
	};

	const isAuthFetching = () => {
		if (!auth) {
			return false;
		}
		return auth.isFetching;
	};

	const isAdmin = () => {
		const auth = isAuthenticated();
		if (!auth) {
			return false;
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return !!auth.roles.find((e: any) => e === 'Admin');
	};

	const isDM = () => {
		const auth = isAuthenticated();
		if (!auth) {
			return false;
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return !!auth.roles.find((e: any) => e === 'Admin' || e === 'Dungeon Master');
	};

	const isBotBetaTester = () => {
		const auth = isAuthenticated();
		if (!auth) {
			return false;
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return !!auth.roles.find((e: any) => e === 'Admin' || e === 'BotBetaTester');
	};
	return {
		isAuthenticated,
		isAuthFetching,
		isAdmin,
		isDM,
		isBotBetaTester
	};
}

export function AuthData() {
	const auth = useContext(AuthContext);
	if (!auth || !auth.data) {
		return <div>NO AUTH DATA</div>;
	}
	return (
		<div className="authdata">
			LOADING: {auth.isFetching ? 'true' : 'false'}
			<br />
			FETCH STATUS: {auth.fetchStatus}
			<br />
			auth.isFetching: {auth.isFetching ? 'true' : 'false'}
			<br />
			isSuccess: {auth.isSuccess ? 'true' : 'false'}
			<br />
			Network Error: {auth.isError ? 'true' : 'false'}
			<br />
			Auth Error: {auth.data.error}
			<br />
			DATA: <pre>{JSON.stringify(auth.data, null, 2)}</pre>
			<br />
		</div>
	);
}

function doAuthRedirect() {
	const u = new URL(window.location.href);
	const redirectUri = u.protocol + '//' + u.host + '/oauth/authorize';
	window.location.replace('/oauth/discordredirect?redirect_uri=' + encodeURIComponent(redirectUri));
}
