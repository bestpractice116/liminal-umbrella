import { isAuthenticated, LoginButton } from "./Auth"
import { Navigate } from "react-router-dom"

export default function Login() {
    if (isAuthenticated()) {
        return <Navigate to={'/'} replace />
    }
    return <LoginButton />
}