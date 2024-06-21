import {
    useQuery,
    useQueryClient,
    useMutation,
} from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react';
import { Button } from 'antd';


const fetchAuth = async () => {

  const postsData = await fetch('/oauth/refreshtoken', {
    method: "POST"
  }).then(data => data.json());
  console.log("Fetch done, about to return")
  return postsData
};

const doLogoutCallback = async () => {
    const postsData = await fetch('/oauth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    return await postsData.json()
  };

export function LogoutButton() {
  const queryClient = useQueryClient();
  const logoutCallbackMutation = useMutation({
    mutationFn: doLogoutCallback,
    onSuccess: (_) => {
      queryClient.setQueryData(['auth'], {"error":"Unauthorized"});
    }
  })
  //if (!isAuthenticated()) {
  //    return null
  //}
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

    if (auth && auth.isFetching) {
      console.log(auth);
      console.log("Still fetching")
    }
    if (auth && auth.isError) {
      console.log("isError")
    }
    if (!auth || auth.isFetching || auth.isError || !auth.data || auth.data.error) {
      console.log("NO AUTH");
      return false
    }
    return auth.data;
}

export function isAdmin() {
  const auth = isAuthenticated();
  if (!auth) {
    return false;
  }
  return auth.roles.find((e: any) => e === 'Admin') !== -1;
}

function doAuthRedirect() {
  const u = new URL(window.location.href)
  const redirectUri = u.protocol + '//' + u.host + '/oauth/authorize'
  window.location.replace('/oauth/discordredirect?redirect_uri=' + encodeURIComponent(redirectUri))
}