export interface AuthQueryData {
    user: {
        avatarURL: string;
        discriminator: string;
        id: string;
        username: string;
        global_name: string;
        nickname: string;
    };
    roles: string[];
}

interface AuthSuccess {
    error: false;
}

interface AuthFail {
    error: string;
}

export type AuthFetchResult = AuthQueryData & (AuthSuccess | AuthFail);

export interface AuthQueryResult {
    data: AuthFetchResult | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
    isError: boolean;
    isFetching: boolean;
    isFetched: boolean;
    isPending: boolean;
    isLoading: boolean;
    isSuccess: boolean;
}

export interface LogoutFetchResult {
    success: boolean;
}