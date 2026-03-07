import { Routes, Route, Navigate, Outlet } from 'react-router'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import useAuth from './store/authStore'
import Navbar from './components/Navbar'
import NewTripPage from './pages/NewTripPage'
import JoinTripPage from './pages/JoinTripPage'
import TripPage from './pages/TripPage'
import { useEffect } from 'react'
import { refresh } from './api/loginService'
import { setToken } from './api/api'
import { useState } from 'react'

function App() {
  const setUser = useAuth(state => state.setUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const user = await refresh()
        setToken(user.token)
        setUser(user)
      }
      catch (e) {
        console.error(e)
      }
      finally {
        setIsLoading(false)
      }
    }
    refreshToken()
  }, [])

  if (isLoading) {
    return (
      <div className="initializing-page">
        Initializing...
      </div>
    )
  }


  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/newtrip" element={<NewTripPage />} />
          <Route path="/jointrip" element={<JoinTripPage />} />
          <Route path="/trips/:tripId" element={<TripPage />} />
        </Route>
      </Routes>
    </div>
  )
}

const ProtectedRoute = () => {
  const user = useAuth(state => state.user)
  // const location = useLocation()

  if (!user) {
    // return <Navigate to="/login" state={{ from: location.pathname }} replace />
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default App
