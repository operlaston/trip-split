import { Routes, Route, Navigate, Outlet } from 'react-router'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import useAuth from './store/authStore'
import Navbar from './components/Navbar'

function App() {

  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </div>
  )
}

const ProtectedRoute = () => {
  const user = useAuth(state => state.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Outlet />
    </>
  )
}

export default App
