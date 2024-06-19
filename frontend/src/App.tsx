import './App.css'
import Breadcrumb from 'antd/lib/breadcrumb/breadcrumb'
import Layout, { Header, Footer, Content } from 'antd/es/layout/layout'
import Menu from 'antd/es/menu/menu'
import ConfigProvider from 'antd/es/config-provider'
import Avatar from 'antd/es/avatar/avatar'
import { UserOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ErrorBoundary  } from "react-error-boundary";

import HomePage from "./Homepage"
import { AuthProvider, isAuthenticated, isAdmin } from "./Auth"

import AdminUsers from "./admin/Users";
import AdminCogs from "./admin/Cogs";
import AdminRoles from "./admin/Roles";
import AdminGamesystems from "./admin/Gamesystems";
import AdminBotplaying from "./admin/Botplaying";

const Fallback = ({ error }: {error: Error, resetErrorBoundary: Function }) => {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
    </div>
  );
}

function TopMenu() {
  const items : any = [];

  if (isAdmin()) {
    items.push({
      key: 'admin',
      label: 'Admin',
      //onClick: () => alert('Admin'),
      children: [
        {
          key: 'admin/users',
          label: 'Users',
        },
        {
          key: 'admin/cogs',
          label: 'Cogs',
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
      ],
    });
  }

  const auth = isAuthenticated();
  if (auth) {
    new Array(3).fill(null).forEach((_, index) => {
      items.push({
        key: index + 1,
        label: `nav ${index + 1}`,
        onClick: () => console.log(`nav ${index + 1}`),
      });
    })
  }

  const avatarSrc = auth ? auth.user.avatarURL : null;
  const avatarIcon = auth ? null : <UserOutlined />;

  const navigate = useNavigate();

  const handleMenuClick = ({ key }: any) => {
    if (key) {
      navigate(key);
    }
  };

  return <Header style={{ display: 'flex', alignItems: 'center' }}>
    <Avatar icon={avatarIcon} src={avatarSrc} shape="square" size="large" className="avatarIcon" />
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={['2']}
      items={items}
      style={{ flex: 1, minWidth: 0 }}
      onClick={handleMenuClick}
    />
  </Header>
}

function Crumbs() {
  const auth = isAuthenticated();
  if (!auth) {
    return <></>;
  }
  const items=[
    { title: 'Home' },
    { title: 'List' },
    { title: 'App' },
  ]
  return <Breadcrumb style={{ margin: '16px 0' }} items={items} />
}

function App() {
  const queryClient = new QueryClient();

  return (
    <Router>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
        <AuthProvider>
          <Layout>
            <TopMenu />
            <Content style={{ padding: '0 48px' }}>
              <Crumbs />
              <div
                style={{
                  minHeight: 280,
                  padding: 24,
                }}
              >
                <ErrorBoundary FallbackComponent={Fallback}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/cogs" element={<AdminCogs />} />
                    <Route path="/admin/roles" element={<AdminRoles />} />
                    <Route path="/admin/gamesystems" element={<AdminGamesystems />} />
                    <Route path="/admin/botplaying" element={<AdminBotplaying />} />
                  </Routes>
                </ErrorBoundary>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              Preston RPG Discord Admins ©{new Date().getFullYear()} built with ❤️ by Tomas D
            </Footer>
          </Layout>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
    </Router>
  )
}

export default App
