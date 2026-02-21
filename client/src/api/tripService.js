import { api } from './api'

export const getTrips = async () => {
  const response = await api.get('/trips')
  return response.data
}

export const createTrip = async (newTrip) => {
  const newTripFormatted = {
    name: newTrip.name,
    target_currency: newTrip.targetCurrency
  }
  const response = await api.post('/trips', newTripFormatted)
  return response.data
}

export const joinTrip = async (tripId) => {
  const response = await api.post(`/trips/${tripId}/members`, {})
  return response.data
}

export const getTripById = async (tripId) => {
  const response = await api.get(`/trips/${tripId}`)
  return response.data
}

export const getTripMembers = async (tripId) => {
  const response = await api.get(`/trips/${tripId}/members`)
  return response.data
}
