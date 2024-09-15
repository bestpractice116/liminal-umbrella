import { useContext } from "react";
import { AuthContext } from "./Context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LogoutFetchResult } from "./types";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

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