import {
    useQuery,
    QueryClient,
    useMutation,
} from '@tanstack/react-query'
import {  cloneElement } from 'react';

export const queryClient = new QueryClient()

const fetchAuth = async () => {
  console.log('fetching auth')

  const postsData = await fetch('/oauth/refreshtoken', {
    method: "POST"
  }).then(data => data.json());
  console.log('done fetching auth')

  return postsData
};

const doLogoutCallback = async () => {
    console.log('fetching logout')
    const postsData = await fetch('/oauth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    console.log('done fetching logout')
    return await postsData.json()
  };

export function LogoutButton({auth}: {auth: any}) {
    const logoutCallbackMutation = useMutation({
      mutationFn: doLogoutCallback,
      onSuccess: (_) => {
        queryClient.setQueryData(['auth'], {"error":"Unauthorized"});
      }
    })
    if (!isAuthenticated(auth)) {
        return <></>
    }
    return <button onClick={() => {logoutCallbackMutation.mutate()}}>
    Logout
    </button>
  }

export function GetAuth({children}: {children: React.ReactNode}) {
  const result = useQuery({ queryKey: ['auth'], queryFn: fetchAuth })

  return cloneElement(children as React.ReactElement, { auth: result });
}

export function isAuthenticated(auth: any) {
    if (!auth || auth.isFetching || auth.isError || !auth.data || auth.data.error) {
        return false
    }
    return true;
}

export function doAuthRedirect() {
    const u = new URL(window.location.href)
    const redirectUri = u.protocol + '//' + u.host + '/oauth/authorize'
    window.location.replace('/oauth/discordredirect?redirect_uri=' + encodeURIComponent(redirectUri))
  }