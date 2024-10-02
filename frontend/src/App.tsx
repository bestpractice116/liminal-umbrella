import * as React from 'react';
import ConfigProvider from 'antd/es/config-provider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MaybeDebug, DebugContext } from './components/Debug';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './Pages/Homepage';
import { AuthProvider } from './components/Auth';
import { MessageProvider } from './components/BotMessage';
import { EditModeProvider } from './components/EditMode';
import { Login } from './Pages/Login/Login.js';
import { AdminUsers, AdminCogs, AdminRoles, AdminGamesystems, AdminBotplaying, AdminBotMessages } from './Pages/admin';
import { NewGame, ViewGames, ViewGame } from './Pages/dm';
import { NotFound } from './Pages/NotFound';
import { ErrorFallback, ErrorBoundary } from './components/ErrorBoundary';
import { ReactQueryDevtools } from './components/ReactQueryDevtools.js';
import { Page } from './components/Shell';

function PageContent() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
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
                <Route path="/" element={<ProtectedRoute role="Dungeon Master" />}>
                    <Route path="/dm/newgame" element={<NewGame />} />
                    <Route path="/dm/viewgames" element={<ViewGames />} />
                    <Route path="/dm/viewgame/:key" element={<ViewGame />} />
                </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function AppRouter() {
    const queryClient = new QueryClient();
    const { debug } = React.useContext(DebugContext);

    return (
        <Router>
            <QueryClientProvider client={queryClient}>
                {debug && (
                    <React.Suspense fallback={null}>
                        <ReactQueryDevtools />
                    </React.Suspense>
                )}
                <ConfigProvider
                    theme={{
                        token: { colorPrimary: '#00b96b' }
                    }}
                >
                    <EditModeProvider>
                        <MessageProvider>
                            <AuthProvider>
                                <Page>
                                    <PageContent />
                                </Page>
                            </AuthProvider>
                        </MessageProvider>
                    </EditModeProvider>
                </ConfigProvider>
            </QueryClientProvider>
        </Router>
    );
}

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <MaybeDebug>
                <AppRouter />
            </MaybeDebug>
        </ErrorBoundary>
    );
}

export default App;
