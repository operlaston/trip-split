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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const queryClient = useQueryClient()

  const newTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      setIsLoading(false)
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      navigate('/')
    },
    onError: (err) => {
      setIsLoading(false)
      console.error(err)
      setError("an unknown error occurred")
    }
  })

  const handleInput = (e) => {
    setFormData((prev => ({ ...prev, [e.target.name]: e.target.value })))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    newTripMutation.mutate(formData)
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
          <option value="USD">-- Please Select Currency --</option>
          <option value="USD">USD</option>
          <option value="JPY">JPY</option>
          <option value="CNY">CNY</option>
        </select>
        {
          isLoading ? <button className="button-loading">Creating Trip...</button> : <button>Create</button>
        }
        <div className="new-trip-note">*Note: Currency is the unit of money you will use on this trip to track all payments.</div>
        <div className="login-error">{error}</div>
      </form>
    </div>
  )
}

export default NewTripPage
