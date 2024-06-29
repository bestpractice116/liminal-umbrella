import './App.css'
import { useContext } from 'react'
import Layout, { Header, Footer, Content } from 'antd/es/layout/layout'
import Menu from 'antd/es/menu/menu'
import ConfigProvider from 'antd/es/config-provider'
import Avatar from 'antd/es/avatar/avatar'
import Button from "antd/es/button"
import { UserOutlined } from '@ant-design/icons';
import Spin from 'antd/es/spin';
import Tooltip from 'antd/es/tooltip'
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

import { MaybeDebug, DebugContext } from "./Debug"
import { ProtectedRoute } from "./ProtectedRoute"
import HomePage from "./Homepage"
import { AuthProvider, isAuthenticated, isAdmin, LoginButton, isAuthFetching, LogoutButton } from "./Auth"

import AdminUsers from "./admin/Users"
import AdminCogs from "./admin/Cogs"
import AdminRoles from "./admin/Roles"
import AdminGamesystems from "./admin/Gamesystems"
import AdminBotplaying from "./admin/Botplaying"
import AdminBotMessages from "./admin/BotMessages"
import NotFound from "./NotFound";
import { ErrorFallback, ErrorBoundary } from "./ErrorFallback";

function TopMenu(){
  const { debug, setDebug } = useContext(DebugContext);
  const items : any = [];

  const admin = isAdmin()
  if (admin) {
    items.push({
      key: 'admin',
      label: 'Admin',
      children: [
        /*{
          key: 'admin/cogs',
          label: 'Cogs',
        },*/
        {
          key: 'admin/users',
          label: 'Users',
        },
        {
          key: 'admin/roles',
          label: 'Roles',
        },
        {
          key: 'admin/gamesystems',
          label: 'Gamesystems',
        },
        {
          key: 'admin/botplaying',
          label: 'Bot Playing',
        },
        {
          key: 'admin/botmessages',
          label: 'Bot Messages',
        },
      ],
    });
  }

  const auth = isAuthenticated();

  const avatarSrc = auth ? auth.user.avatarURL : null;
  const avatarIcon = auth ? null : <UserOutlined />;

  const navigate = useNavigate();

  const handleMenuClick = ({ key }: any) => {
    if (key) {
      navigate(key);
    }
  };

  const onDebugChange = () => {
    setDebug(!debug);
  }
  return <Header style={{ display: 'flex', alignItems: 'center' }}>
    <Avatar icon={avatarIcon} src={avatarSrc} style={{ marginRight: '20px' }} shape="square" size="large" className="avatarIcon" />
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={['2']}
      items={items}
      style={{ flex: 1, minWidth: 0 }}
      onClick={handleMenuClick}
    />
    {admin ? debug ?
      <Button danger type="primary" onClick={onDebugChange}>Debug Off</Button>
      : <Tooltip title="Note - can break layout"><Button type="dashed" onClick={onDebugChange}>Debug On</Button></Tooltip>
      : <></>}
  </Header>
}

function PageContent() {
  return  <Routes>
            <Route path="/login" element={<LoginButton />} />
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/" element={<ProtectedRoute role="Admin" />}>
                <Route path="/admin/cogs" element={<AdminCogs />} />
                <Route path="/admin/gamesystems" element={<AdminGamesystems />} />
                <Route path="/admin/botplaying" element={<AdminBotplaying />} />
                <Route path="/admin/botmessages" element={<AdminBotMessages />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/roles" element={<AdminRoles />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
}

function AuthLoadingSpinner() {
  if (isAuthFetching()) {
    return <Spin size="large" />
  }
  return <><PageContent /><LogoutButton /></>
}

function Page() {
  return <MaybeDebug>
    <Layout>
          <TopMenu />
          <Content style={{ padding: '0 48px' }}>
            <div
              style={{
                minHeight: 280,
                padding: 24,
              }}
            >
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AuthLoadingSpinner />
              </ErrorBoundary>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Preston RPG Discord Admins ©{new Date().getFullYear()} built with ❤️ by Tomas D
          </Footer>
    </Layout>
  </MaybeDebug>
}

function App() {
  const queryClient = new QueryClient();
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
          <AuthProvider>
            <Page />
          </AuthProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </Router>
  )
}

export default App
