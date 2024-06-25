import { FC, useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from './Auth';

type Props = {
  redirectPath?: string;
  role?: string
};

export const ProtectedRoute: FC<Props> = ({ role, redirectPath = "/login" }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const redirectTo = location.pathname + location.search + location.hash
  if (!auth || auth.isError || !auth.data || ('error' in auth.data && auth.data.error)) {
    return <Navigate to={redirectPath} replace state={{ redirectTo }} />;
  }

  if (auth.isFetching) {
    return null
  }

  if (role && (!auth.data.roles.includes(role)&&!auth.data.roles.includes('Admin'))) {
    return null
  }

  return <Outlet />;
}