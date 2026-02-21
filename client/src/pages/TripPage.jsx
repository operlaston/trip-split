import '../styles/TripPage.css'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { getTripById } from '../api/tripService'
import TripMembers from '../components/trip/TripMembers'

const TripPage = () => {
  const { tripId } = useParams()

  const tripQuery = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTripById(tripId)
  })

  if (tripQuery.isPending) {
    return (
      <div className="trip-page-container">
        Loading Trip Data...
      </div>
    )
  }

  else if (tripQuery.isError) {
    return (
      <div className="trip-page-container">
        An error has occurred while loading trip with id: {tripId}.
      </div>
    )
  }

  const trip = tripQuery.data

  return (
    <div className="trip-page-container">
      <div>This is the trip page for {trip.name} with currency {trip.target_currency}</div>
      <TripMembers />
    </div>
  )
}

export default TripPage
