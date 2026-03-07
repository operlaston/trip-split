import { useNavigate } from 'react-router'
import '../styles/NewTripPage.css'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { joinTrip } from '../api/tripService'

const JoinTripPage = () => {
  const navigate = useNavigate()
  const [tripId, setTripId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()

  const joinTripMutation = useMutation({
    mutationFn: joinTrip,
    onSuccess: () => {
      setIsLoading(false)
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      navigate('/')
    },
    onError: (err) => {
      setIsLoading(false)
      console.error(err)
      if (err.status == 400) {
        setError("trip id must be an integer value")
      }
      else if (err.status == 404) {
        setError("trip with the given id does not exist")
      }
      else {
        setError("an unknown error occurred")
      }
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    joinTripMutation.mutate(tripId)
  }

  return (
    <div className="new-trip-page-container">
      <form className="new-trip-form" onSubmit={handleSubmit}>
        <div>
          <span className="new-trip-back" onClick={() => navigate('/')}>&larr; Go Back</span>
        </div>
        <h1 className="new-trip-header">
          Join Trip
        </h1>
        <input type="text" placeholder="Trip Id" name="name" onChange={(e) => { setTripId(e.target.value); setError("") }} value={tripId} />
        {
          isLoading ? <button disabled className="button-loading">Joining...</button> : <button>Join</button>
        }
        <div className="error-message">{error}</div>
      </form>
    </div>
  )
}

export default JoinTripPage
