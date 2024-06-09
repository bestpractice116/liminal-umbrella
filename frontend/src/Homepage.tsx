import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function redirect() {
  const DiscordOauthURL = 'https://discord.com/oauth2/authorize';

  const oauthURL = new URL(DiscordOauthURL);
  oauthURL.search = new URLSearchParams([
    ['redirect_uri', 'http://127.0.0.1:5173/oauth/return'],
    ['response_type', 'code'],
    ['scope', ['identify'].join(' ')],
    ['client_id', '1206722586206281749']
  ]).toString();
  window.location.replace(oauthURL);
}

function AuthData(props: {auth: any}) {
  if (!props.auth || !props.auth.data) {
    return <div>NO AUTH DATA</div>
  }
  return <div>
  LOADING: {props.auth.isFetching ? 'true' : 'false'}<br />
  Network Error: {props.auth.isError}<br />
  Auth Error: {props.auth.data.error}<br />
  DATA: {JSON.stringify(props.auth.data)}<br />
  </div>
}

function HomePage(props: {auth: any}) {

  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <AuthData auth={props.auth} />
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">


        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={redirect}>
          DO AUTH FLOW
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default HomePage
