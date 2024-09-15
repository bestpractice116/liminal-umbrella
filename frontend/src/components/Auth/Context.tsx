import { useQuery } from '@tanstack/react-query';
import { createContext } from 'react';
import { AuthFetchResult } from './types';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

async function fetchAuth(): Promise<AuthFetchResult> {
	return fetch(
		'/oauth/refreshtoken',
		{
			method: 'POST'
		},
		FetchResultTypes.JSON
	) as unknown as Promise<AuthFetchResult>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthContext = createContext(null as any);
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const result = useQuery({ queryKey: ['auth'], queryFn: fetchAuth, notifyOnChangeProps: 'all', retry: 0 });
	return <AuthContext.Provider value={result}>{children}</AuthContext.Provider>;
}
