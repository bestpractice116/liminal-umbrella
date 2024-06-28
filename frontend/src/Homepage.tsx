import List from 'antd/es/list'
import Typography from 'antd/es/typography'
import { useContext } from 'react';
import { AuthData, isAuthenticated } from './Auth';
import { DebugContext } from './Debug';
import './App.css'

function HomePage() {
  const { debug } = useContext(DebugContext);
  const auth = isAuthenticated()
  return (
    <>
      <div>
        <div className="card">
          {debug ? <AuthData /> : <></>}
          Welcome {auth.user.nickname} to the Preston RPG Discord bot!
          <br />
          Please see the menus at the top to find your way around.
        </div>
        <List
          header={<div>Your Roles:</div>}
          bordered
          dataSource={auth.roles}
          renderItem={(item: string) => (
            <List.Item>
              {item}
            </List.Item>
          )}
        />
      </div>
    </>
  )
}

export default HomePage
