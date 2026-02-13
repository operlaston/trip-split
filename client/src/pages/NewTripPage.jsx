import { useNavigate } from 'react-router'
import '../styles/NewTripPage.css'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTrip } from '../api/tripService'

const NewTripPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    targetCurrency: ""
  })

  const queryClient = useQueryClient()

  const newTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    }
  })

  const handleInput = (e) => {
    setFormData((prev => ({ ...prev, [e.target.name]: e.target.value })))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    newTripMutation.mutate(formData)
    navigate('/')
  }

  return (
    <div className="new-trip-page-container">
      <form className="new-trip-form" onSubmit={handleSubmit}>
        <div>
          <span className="new-trip-back" onClick={() => navigate('/')}>&larr; Go Back</span>
        </div>
        <h1 className="new-trip-header">
          New Trip
        </h1>
        <input type="text" placeholder="Trip Name" name="name" onChange={handleInput} value={formData.name} />
        <select name="targetCurrency" value={formData.targetCurrency} onChange={handleInput}>
          <option value="USD">-- Please Select Target Currency --</option>
          <option value="USD">USD</option>
          <option value="JPY">JPY</option>
          <option value="CNY">CNY</option>
        </select>
        <button>Create</button>
        <div className="new-trip-note">*Note: Target currency is the currency you plan to use to pay your friends back. All payments from the trip will be converted back to this currency.</div>
      </form>
    </div>
  )
}

export default NewTripPage
