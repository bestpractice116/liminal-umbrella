import {
    useQuery,
    QueryClient,
    useMutation,
} from '@tanstack/react-query'
import { useEffect, cloneElement } from 'react';

export const queryClient = new QueryClient()

const fetchAuth = async () => {
  console.log('fetching auth')

  const postsData = await fetch('/oauth/refreshtoken', {
    method: "POST"
  });
  console.log('done fetching auth')

  return await postsData.json()
};

const doAuthCallback = async () => {
  console.log('fetching auth')
  const codeSearchParam = new URL(window.location.href).searchParams.get('code');
  const postsData = await fetch('/oauth/callback', {
      method: 'POST',
      body: JSON.stringify({
        code: codeSearchParam,
        redirectUri: 'http://127.0.0.1:5173/oauth/return',
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  console.log('done fetching auth')

  return await postsData.json()
};


export function AuthCallback() {
  console.log('auth callback')
  const authCallbackMutation = useMutation({
    mutationFn: doAuthCallback,
    onSuccess: (data) => {
        queryClient.setQueryData(['auth'], data)
    }
  })
  useEffect(() => {
    if(authCallbackMutation.isIdle) {
        authCallbackMutation.mutate()
    }
 }, [])
/* auth.isFetching ? 'true' : 'false'}<br />
  Network Error: {props.auth.isError}<br />
  Auth Error: {props.auth.data.error
    */

  return <div></div> //AUTHED: {JSON.stringify(authCallbackMutation)}</div>;
}

export function CheckAuth({children}: {children: React.ReactNode}) {
  const result = useQuery({ queryKey: ['auth'], queryFn: fetchAuth })

  return cloneElement(children as React.ReactElement, { auth: result});
}