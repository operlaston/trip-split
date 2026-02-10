import useAuth from '../store/authStore'
import '../styles/HomePage.css'
import Navbar from '../components/Navbar.jsx'
import { useQuery } from '@tanstack/react-query'
import { getTrips } from '../api/tripService.js'

const HomePage = () => {
  const user = useAuth(state => state.user)
  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  })

  return (
    <div className="home-page-container">
      <div>
        Welcome, {user.name}
      </div>
      <div>
        username: {user.username}
      </div>
      <div>
        id: {user.id}
      </div>
      {tripsQuery.isPending && <div>loading trips...</div>}
      {tripsQuery.isError && <div>an error occurred while trying to load trips</div>}
      {tripsQuery.data &&
        tripsQuery.data.map(trip => {
          return <div key={trip.id}>{trip.name}</div>
        })
      }
    </div>
  )
}

export default HomePage
