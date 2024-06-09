import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  QueryClientProvider,
} from '@tanstack/react-query'
import HomePage from "./Homepage"
import AboutPage from "./Aboutpage"
import AuthReturn from "./AuthReturn"
import { CheckAuth, queryClient } from "./Auth"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<CheckAuth><HomePage /></CheckAuth>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/oauth/return" element={<AuthReturn />} />
      </Routes>
    </Router>
    </QueryClientProvider>
  )
}

export default App
