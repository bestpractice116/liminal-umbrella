import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { createContext } from 'react';
import { AuthFetchResult } from './types';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

function fetchAuth(): Promise<AuthFetchResult> {
    return fetch(
        '/oauth/refreshtoken',
        {
            method: 'POST'
        },
        FetchResultTypes.JSON
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AuthContext = createContext({isFetching: true} as UseQueryResult<AuthFetchResult>);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const result = useQuery({ queryKey: ['auth'], queryFn: fetchAuth, notifyOnChangeProps: 'all', retry: 0 });
    return <AuthContext.Provider value={result}>{children}</AuthContext.Provider>;
}
