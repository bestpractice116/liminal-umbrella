import { LogoutButton, doAuthRedirect, isAuthenticated } from './Auth';
import './App.css'
import { Button } from 'antd';

function AuthData(props: {auth: any}) {
  if (!props.auth || !props.auth.data) {
    return <div>NO AUTH DATA</div>
  }
  return <div className="authdata">
  LOADING: {props.auth.isFetching ? 'true' : 'false'}<br />
  Network Error: {props.auth.isError}<br />
  Auth Error: {props.auth.data.error}<br />
  DATA: <pre>{JSON.stringify(props.auth.data, null, 2)}</pre><br />
  </div>
}

function HomePage(props: {auth: any} = {auth: null}) {
  return (
    <>
      <div>
        <div className="card">
          {!isAuthenticated(props.auth) ?
            <Button type="primary" onClick={doAuthRedirect}>Login</Button>
            : <>
              <AuthData auth={props.auth} />
              <LogoutButton auth={props.auth} />
            </>
          }
        </div>
      </div>
    </>
  )
}

export default HomePage
