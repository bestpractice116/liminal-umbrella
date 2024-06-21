import { LogoutButton, AuthData } from './Auth';
import './App.css'

function HomePage() {
  return (
    <>
      <div>IN HOMEPAGE
        <div className="card">
          <AuthData />
          <LogoutButton />
        </div>
      </div>
    </>
  )
}

export default HomePage
