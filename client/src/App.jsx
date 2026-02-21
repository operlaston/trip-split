import { Routes, Route, Navigate, Outlet } from 'react-router'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import useAuth from './store/authStore'
import Navbar from './components/Navbar'
import NewTripPage from './pages/NewTripPage'
import JoinTripPage from './pages/JoinTripPage'
import TripPage from './pages/TripPage'

function App() {

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
  if (!user) {
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
