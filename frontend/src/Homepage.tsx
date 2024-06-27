import { useContext } from 'react';
import { AuthData } from './Auth';
import { DebugContext } from './Debug';
import './App.css'

function HomePage() {
  const { debug } = useContext(DebugContext);
  return (
    <>
      <div>
        <div className="card">
          {debug ? <AuthData /> : <></>}
        </div>
      </div>
    </>
  )
}

export default HomePage
