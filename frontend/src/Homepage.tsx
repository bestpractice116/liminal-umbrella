import { LogoutButton, LoginButton, isAuthenticated, AuthContext } from './Auth';
import './App.css'
import { useContext } from 'react';

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

function HomePage() {
  console.log('HomePage')
  return (
    <>
      <div>IN HOMEPAGE
        <div className="card">
          <LoginButton />MOOO
          {isAuthenticated() && <AuthData />}
          <LogoutButton />
        </div>
      </div>
    </>
  )
}

export default HomePage
