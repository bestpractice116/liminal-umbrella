import {
    useQuery,
    useQueryClient,
    useMutation,
} from '@tanstack/react-query'
import { createContext, useContext } from 'react';
import { Button } from 'antd';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

export type AuthQueryData = {
  user: {
    avatarURL: string
    discriminator: string
    id: string
    username: string
    global_name: string
    nickname: string
  }
  roles: string[]
}

export type AuthError = {
  error: string
}

export type AuthFetchResult = AuthQueryData | AuthError

export type AuthQueryResult = {
  data: AuthFetchResult | undefined
  error: any
  isError: boolean
  isFetching: boolean
  isFetched: boolean
  isPending: boolean
  isLoading: boolean
  isSuccess: boolean
}

async function fetchAuth(): Promise<AuthFetchResult> {
  return fetch('/oauth/refreshtoken', {
    method: "POST"
  }, FetchResultTypes.JSON);
};

export type LogoutFetchResult = {
  success: boolean
}

async function doLogoutCallback(): Promise<LogoutFetchResult> {
    return fetch('/oauth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json'
      }
    }, FetchResultTypes.JSON);
  };

export function LogoutButton() {
  const queryClient = useQueryClient();
  const logoutCallbackMutation = useMutation({
    mutationFn: doLogoutCallback,
    onSuccess: (_) => {
      queryClient.setQueryData(['auth'], {"error":"Unauthorized"});
    }
  })
  if (!isAuthenticated()) {
      return null
  }
  return <Button type="primary" onClick={() => {logoutCallbackMutation.mutate()}}>Logout</Button>
}

export function LoginButton() {
  if (isAuthenticated()) {
    return null;
  }
  return <Button type="primary" onClick={doAuthRedirect} className="login-form-button">Login</Button>
}

export const AuthContext = createContext(null as any);
export function AuthProvider({children}: {children: React.ReactNode}) {
  const result = useQuery({ queryKey: ['auth'], queryFn: fetchAuth, notifyOnChangeProps: 'all'});
  console.log("AuthProvider", result)
  return (
    <AuthContext.Provider value={result}>
        {children}
    </AuthContext.Provider>
  );
}

export function isAuthenticated() {
    const auth = useContext(AuthContext);

    if (!auth || auth.isFetching || auth.isError || !auth.data || auth.data.error) {
      return false
    }
    return auth.data;
}

export function isAuthFetching() {
  const auth = useContext(AuthContext);

    if (!auth) {
      return false
    }
    return auth.isFetching
}

export function isAdmin() {
  const auth = isAuthenticated();
  if (!auth) {
    return false;
  }
  return auth.roles.find((e: any) => e === 'Admin') !== -1;
}

export function AuthData() {
  const auth = useContext(AuthContext);
  if (!auth || !auth.data) {
    return <div>NO AUTH DATA</div>
  }
  return <div className="authdata">
  LOADING: {auth.isFetching ? 'true' : 'false'}<br />
  FETCH STATUS: {auth.fetchStatus}<br />
  auth.isFetching: {auth.isFetching? 'true' : 'false'}<br />
  isSuccess: {auth.isSuccess? 'true' : 'false'}<br />
  Network Error: {auth.isError? 'true' : 'false'}<br />
  Auth Error: {auth.data.error}<br />
  DATA: <pre>{JSON.stringify(auth.data, null, 2)}</pre><br />
  </div>
}

function doAuthRedirect() {
  const u = new URL(window.location.href)
  const redirectUri = u.protocol + '//' + u.host + '/oauth/authorize'
  window.location.replace('/oauth/discordredirect?redirect_uri=' + encodeURIComponent(redirectUri))
}