import { Link } from "react-router"
import '../styles/Navbar.css'

const Navbar = () => {
  return (
    <nav>
      <Link to='/'>
        TripSplit
      </Link>
      <div className="nav-buttons-wrapper">
        <button className="join-trip-button">Join a Trip</button>
        <button className="create-trip-button">Create a Trip</button>
      </div>
    </nav>
  )
}

export default Navbar
