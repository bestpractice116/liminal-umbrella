import { FC, useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthQueryResult, AuthContext } from './Auth';

type Props = {
  redirectPath?: string;
  role?: string
};

export const ProtectedRoute: FC<Props> = ({ redirectPath = "/login" }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  if (!auth || auth.isFetching) {
    return null
  }

  if (auth.isError || !auth.data || ('error' in auth.data && auth.data.error)) {
    return <Navigate to={redirectPath} replace state={{ redirectTo: location }} />;
  }

  return <Outlet />;
}