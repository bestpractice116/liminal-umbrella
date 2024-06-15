import './App.css'
import { Breadcrumb, Layout, Menu, theme, ConfigProvider, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query'
import HomePage from "./Homepage"
import { AuthProvider, queryClient, isAuthenticated, isAdmin } from "./Auth"

const { Header, Footer, Content } = Layout; // Sider,


function TopMenu() {
  const items : any = [];

  if (isAdmin()) {
    items.push({
      key: 'admin',
      label: 'Admin',
      onClick: () => alert('Admin'),
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

  return <Header style={{ display: 'flex', alignItems: 'center' }}>
    <Avatar icon={avatarIcon} src={avatarSrc} shape="square" size="large" />
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={['2']}
      items={items}
      style={{ flex: 1, minWidth: 0 }}
    />
  </Header>
}

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
        <AuthProvider>
          <Layout>
            <TopMenu />
            <Content style={{ padding: '0 48px' }}>
              <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>List</Breadcrumb.Item>
                <Breadcrumb.Item>App</Breadcrumb.Item>
              </Breadcrumb>
              <div
                style={{
                  background: colorBgContainer,
                  minHeight: 280,
                  padding: 24,
                  borderRadius: borderRadiusLG,
                }}
              >
                <Router>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                  </Routes>
                </Router>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              Preston RPG Discord Admins ©{new Date().getFullYear()} built with ❤️ by Tomas D
            </Footer>
          </Layout>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
