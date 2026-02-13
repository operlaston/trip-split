import useAuth from '../store/authStore'
import '../styles/HomePage.css'
import Navbar from '../components/Navbar.jsx'
import { useQuery } from '@tanstack/react-query'
import { getTrips } from '../api/tripService.js'
import { useNavigate } from 'react-router'
import TripCard from '../components/home/TripCard.jsx'

const testTrips = [
  {
    name: "Japan 2025-26",
    in_progress: false,
    created_at: "2025-07-21 10:00:00-05:00"
  },
  {
    name: "Sweden 2026",
    in_progress: true,
    created_at: "2026-01-21 10:00:00-06:00"
  },
  {
    name: "asdf",
    in_progress: true,
    created_at: "2026-01-22 10:00:00-06:00"
  },
  {
    name: "qwerty",
    in_progress: false,
    created_at: "2026-01-02 10:00:00-06:00"
  },
]

const HomePage = () => {
  const user = useAuth(state => state.user)
  const navigate = useNavigate()
  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  })

  // const tripsQuery = {
  //   data: testTrips
  // }

  const trips = tripsQuery.data
  if (trips) {
    trips.sort((a, b) => b.in_progress - a.in_progress)
  }

  return (
    <div className="home-page-container">
      <div className="home-content-container">
        <div className="home-top-container">
          <h2 className="home-greet">
            Welcome back, {user.name}!
          </h2>
          <div className="home-trip-actions">
            <button className="create-trip-button home-action-button" onClick={() => navigate('/newtrip')}>+ Create a New Trip</button>
            <button className="join-trip-button home-action-button">Join a Trip</button>
          </div>
        </div>
        <div className="home-trips-section-container">
          <h2>Your Trips</h2>
          <div className="trips-wrapper">
            {tripsQuery.isPending && <div>loading trips...</div>}
            {tripsQuery.isError && <div>an error occurred while trying to load trips</div>}
            {trips &&
              trips.map(trip => {
                return (
                  <TripCard
                    key={trip.id}
                    name={trip.name}
                    status={trip.in_progress ? "In Progress" : "Completed"}
                    created_at={trip.created_at}
                  />
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
