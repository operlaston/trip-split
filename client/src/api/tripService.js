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
