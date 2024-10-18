import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { Button } from 'antd';
import { useAuthStatus } from './hooks';
import { AuthContext } from './Context';

export function LoginButton() {
    const location = useLocation();
    const { isAuthenticated } = useAuthStatus();
    if (isAuthenticated()) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const redirectTo: string = location.state?.redirectTo || '/';
    let returnTo = '/';
    if (redirectTo) {
        returnTo = redirectTo;
    }
    if (redirectTo === '/login') {
        returnTo = '/';
    }
    sessionStorage.setItem('beforeLogin', returnTo);
    return (
        <Button type="primary" onClick={doAuthRedirect} className="login-form-button">
            Login
        </Button>
    );
}

export function AuthData() {
    const auth = useContext(AuthContext);
    if (!auth.data) {
        return <div>NO AUTH DATA</div>;
    }
    return (
        <div className="authdata">
            LOADING: {auth.isFetching ? 'true' : 'false'}
            <br />
            FETCH STATUS: {auth.fetchStatus}
            <br />
            auth.isFetching: {auth.isFetching ? 'true' : 'false'}
            <br />
            isSuccess: {auth.isSuccess ? 'true' : 'false'}
            <br />
            Network Error: {auth.isError ? 'true' : 'false'}
            <br />
            Auth Error: {auth.data.error}
            <br />
            DATA: <pre>{JSON.stringify(auth.data, null, 2)}</pre>
            <br />
        </div>
    );
}

function doAuthRedirect() {
    const u = new URL(window.location.href);
    const redirectUri = u.protocol + '//' + u.host + '/oauth/authorize';
    window.location.replace('/oauth/discordredirect?redirect_uri=' + encodeURIComponent(redirectUri));
}
