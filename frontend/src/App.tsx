import './App.css'
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd';
import HomePage from "./Homepage"
import { GetAuth, queryClient } from "./Auth"

const { Header, Footer, Content } = Layout; // Sider,
const items = new Array(15).fill(null).map((_, index) => ({
  key: index + 1,
  label: `nav ${index + 1}`,
}));

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
        <Layout>
          <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div className="demo-logo" />
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              items={items}
              style={{ flex: 1, minWidth: 0 }}
            />
          </Header>
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
                  <Route path="/" element={<GetAuth><HomePage auth={null}/></GetAuth>} />
                </Routes>
              </Router>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Preston RPG Discord Admins ©{new Date().getFullYear()} built with ❤️ by Tomas D
          </Footer>
        </Layout>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
