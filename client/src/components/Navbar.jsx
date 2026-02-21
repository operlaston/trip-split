import { Link } from "react-router"
import '../styles/Navbar.css'
import useAuth from '../store/authStore'

const Navbar = () => {
  const setUser = useAuth(state => state.setUser)

  return (
    <nav>
      <div className="nav-inner-wrapper">
        <Link to='/'>
          TripSplit
        </Link>
        <div className="nav-buttons-wrapper">
          <button onClick={() => setUser(null)}>Logout</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
