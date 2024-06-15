import { LogoutButton, LoginButton, isAuthenticated, AuthContext } from './Auth';
import './App.css'
import { useContext } from 'react';

function AuthData() {
  const auth = useContext(AuthContext);
  if (!auth || !auth.data) {
    return <div>NO AUTH DATA</div>
  }
  return <div className="authdata">
  LOADING: {auth.isFetching ? 'true' : 'false'}<br />
  Network Error: {auth.isError}<br />
  Auth Error: {auth.data.error}<br />
  DATA: <pre>{JSON.stringify(auth.data, null, 2)}</pre><br />
  </div>
}

function HomePage() {
  return (
    <>
      <div>
        <div className="card">
          <LoginButton />
          {isAuthenticated() && <AuthData />}
          <LogoutButton />
        </div>
      </div>
    </>
  )
}

export default HomePage
