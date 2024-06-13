import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { LogoutButton, doAuthRedirect, isAuthenticated } from './Auth';
import './App.css'


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
            <button onClick={doAuthRedirect}>
              Login
            </button>
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
