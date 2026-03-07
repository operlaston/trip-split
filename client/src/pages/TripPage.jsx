import '../styles/TripPage.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { getTripById, lockTrip, unlockTrip, getTransactions, getTripMembers } from '../api/tripService'
import TripMembers from '../components/trip/TripMembers'
import Transactions from '../components/trip/Transactions'
import { useEffect, useState } from 'react'
import NewTransaction from '../components/trip/NewTransaction'
import useTrip from '../store/tripStore'

const TripPage = () => {
  const { tripId } = useParams()
  const queryClient = useQueryClient()
  const isCreatingTransaction = useTrip(state => state.isCreatingTransaction)
  const setIsCreatingTransaction = useTrip(state => state.setIsCreatingTransaction)

  useEffect(() => {
    setIsCreatingTransaction(false)
  }, [])

  const tripQuery = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTripById(tripId),
    retry: (failureCount, err) => {
      if (err.response?.status === 403) {
        return false
      }
      return failureCount < 3
    }
  })

  const transactionsQuery = useQuery({
    queryKey: ['transactions', tripId],
    queryFn: () => getTransactions(tripId)
  })

  const tripMembersQuery = useQuery({
    queryKey: ['tripMembers', tripId],
    queryFn: () => getTripMembers(tripId)
  })

  const lockTripMutation = useMutation({
    mutationFn: lockTrip,
    onSuccess: () => {
      const trip = queryClient.getQueryData(['trip', tripId])
      queryClient.setQueryData(['trip', tripId], { ...trip, locked: true })
    },
    onError: (err) => {
      console.error("an error occurred while trying to lock the trip", err)
    }
  })

  const unlockTripMutation = useMutation({
    mutationFn: unlockTrip,
    onSuccess: () => {
      const trip = queryClient.getQueryData(['trip', tripId])
      queryClient.setQueryData(['trip', tripId], { ...trip, locked: false })
    },
    onError: (err) => {
      console.error("an error occurred while trying to lock the trip", err)
    }
  })

  if (tripQuery.isPending || tripMembersQuery.isPending || transactionsQuery.isPending) {
    return (
      <div className="trip-page-container">
        Loading Trip Data...
      </div>
    )
  }

  else if (tripQuery.isError || tripMembersQuery.isError || transactionsQuery.isError) {
    if (tripQuery.error?.status === 403) {
      return (
        <div className="trip-page-container">
          <h1>Forbidden</h1>
          <div>You are forbidden from viewing this trip.</div>
        </div>
      )
    }
    return (
      <div className="trip-page-container">
        An error has occurred while loading trip with id: {tripId}.
      </div>
    )
  }


  const lock = () => {
    lockTripMutation.mutate(tripId)
  }

  const unlock = () => {
    unlockTripMutation.mutate(tripId)
  }

  const trip = tripQuery.data

  return (
    <div className="trip-page-container">
      <div className="trip-content-container">
        <h1>
          <span>{trip.name}</span>
          {
            trip.locked
              ?
              <svg onClick={unlock} xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M12 0a4 4 0 0 1 4 4v2.5h-1V4a3 3 0 1 0-6 0v2h.5A2.5 2.5 0 0 1 12 8.5v5A2.5 2.5 0 0 1 9.5 16h-7A2.5 2.5 0 0 1 0 13.5v-5A2.5 2.5 0 0 1 2.5 6H8V4a4 4 0 0 1 4-4" />
              </svg>
              :
              <svg onClick={lock} xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
              </svg>
          }
        </h1>
        <div className="trip-actions">
          <h2 className="trip-id"><b>Join Code: {trip.id}</b></h2>
          <div><i>This trip is currently {trip.locked ? "locked" : "unlocked"} meaning {trip.locked ? "no new members may join." : "new members may join."} Click the lock icon to {trip.locked ? "unlock the trip." : "lock the trip."}</i></div>
          <button className="add-transaction-btn" onClick={() => setIsCreatingTransaction(prev => !prev)}>+ Add Transaction</button>
        </div>
        <div className="trip-body-container">
          <div className="trip-section-container">
            <Transactions />
          </div>
          <div className="trip-section-container">
            <TripMembers />
          </div>
        </div>
      </div>
      {isCreatingTransaction ? <NewTransaction /> : ""}
    </div>
  )
}

export default TripPage
