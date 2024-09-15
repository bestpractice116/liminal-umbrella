export type AuthQueryData = {
	user: {
		avatarURL: string;
		discriminator: string;
		id: string;
		username: string;
		global_name: string;
		nickname: string;
	};
	roles: string[];
};

export type AuthError = {
	error: string;
};

export type AuthFetchResult = AuthQueryData | AuthError;

export type AuthQueryResult = {
	data: AuthFetchResult | undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: any;
	isError: boolean;
	isFetching: boolean;
	isFetched: boolean;
	isPending: boolean;
	isLoading: boolean;
	isSuccess: boolean;
};

export type LogoutFetchResult = {
	success: boolean;
};