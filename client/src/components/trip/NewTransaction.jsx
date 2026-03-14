import useTrip from "../../store/tripStore"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import useAuth from "../../store/authStore"
import { createTransaction } from "../../api/transactionService"
import "../../styles/NewTransaction.css"

const NewTransaction = () => {
  const user = useAuth(state => state.user)
  const { tripId } = useParams()
  const [formData, setFormData] = useState({
    description: '',
    amount: '0',
    payer: user.id
  })
  const [error, setError] = useState('')
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)

  const setIsCreatingTransaction = useTrip(state => state.setIsCreatingTransaction)
  const queryClient = useQueryClient()
  const trip = queryClient.getQueryData(['trip', tripId])
  const tripMembers = queryClient.getQueryData(['tripMembers', tripId])
  const newTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions', tripId])
      setIsCreatingTransaction(false)
    },
    onError: (err) => {
      setIsAddingTransaction(false)
      setError("Something went wrong while trying to add transaction")
      console.error(err)
    }
  })

  const [splits, setSplits] = useState(() => {
    const initialState = {}
    tripMembers.forEach(member => {
      initialState[member.user_id] = 0
    })
    return initialState
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setError('')
    if (name === 'amount') {
      // if empty, reset value to 0
      if (value === '') {
        setFormData(prevState => ({ ...prevState, [name]: '0' }))
        return;
      }
      let newValue = value
      // delete leading 0s
      if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
        newValue = newValue.replace(/^0+/, '')
        if (newValue === '') {
          newValue = '0'
        }
      }
      const isValidAmount = /^\d*\.?\d{0,2}$/.test(newValue)
      if (isValidAmount) {
        setFormData(prevState => ({ ...prevState, [name]: newValue }))
      }
    }
    else {
      setFormData(prevState => ({ ...prevState, [name]: value }))
    }
  }

  const handleSplitChange = (userId, amount) => {
    // if empty, reset value to 0
    if (amount === '') {
      setSplits(prevState => ({ ...prevState, [userId]: '0' }))
      return;
    }
    let newAmount = amount
    // delete leading 0s
    if (amount.length > 1 && amount[0] === '0' && amount[1] !== '.') {
      newAmount = newAmount.replace(/^0+/, '')
      if (newAmount === '') {
        newAmount = '0'
      }
    }
    const isValidAmount = /^\d*\.?\d{0,2}$/.test(newAmount)
    if (isValidAmount) {
      setSplits(prevState => ({ ...prevState, [userId]: newAmount }))
    }
  }

  const splitEvenly = () => {
    const equalSplit = Math.floor((formData.amount / tripMembers.length) * 100) / 100
    const leftover = equalSplit === 0 ? 0 : formData.amount % equalSplit
    const equalSplits = {}
    tripMembers.forEach(member => {
      equalSplits[member.user_id] = equalSplit;
    })
    equalSplits[user.id] = Math.round((equalSplit + leftover) * 100) / 100
    setSplits(equalSplits)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsAddingTransaction(true)
    if (formData.amount == 0) {
      setError("Amount must be greater than 0")
      setIsAddingTransaction(false)
      return
    }
    if (formData.description === '') {
      setError("Please add a description")
      setIsAddingTransaction(false)
      return
    }
    let splitsTotal = 0
    tripMembers.forEach(member => { splitsTotal += parseFloat(splits[member.user_id]) })
    if (splitsTotal < formData.amount - 0.001 || splitsTotal > formData.amount + 0.001) {
      setError("Contributions must add up to total amount")
      setIsAddingTransaction(false)
      return
    }

    // transactionSplits is an array of { owingUser, amountOwed } objects
    const transactionSplits = Object.entries(splits).map(([id, amount]) => ({
      owingUser: id,
      amountOwed: amount
    }))
    const newTransaction = {
      payingUser: formData.payer,
      amountPaid: formData.amount,
      description: formData.description,
      transactionSplits
    }
    newTransactionMutation.mutate({ tripId, newTransaction })
  }


  return (
    <div className="new-transaction-modal-container">
      <form className="new-transaction-form" onSubmit={handleSubmit}>
        <div>
          <span
            className="new-transaction-back"
            onClick={() => isAddingTransaction ? '' : setIsCreatingTransaction(false)}
          >
            &larr;
          </span>
        </div>
        <h2>New Transaction</h2>
        <div className="new-transaction-label-input">
          <label htmlFor="tactn-payer">Who Paid?</label>
          <select id="tactn-payer" name="payer" onChange={handleChange} value={formData.payer}>
            <option value={user.id}>Me ({user.username})</option>
            {
              tripMembers.map(member => {
                if (member.user_id === user.id) return;
                return (
                  <option key={member.user_id} value={member.user_id}>{member.username}</option>
                )
              })
            }
          </select>
        </div>
        <div className="new-transaction-label-input">
          <label htmlFor="tactn-desc">Description</label>
          <input id="tactn-desc" type="text" maxLength="50" placeholder="What is this transaction for?" name="description" onChange={handleChange} value={formData.description} />
        </div>
        <div className="new-transaction-label-input">
          <label htmlFor="tactn-amount">Amount</label>
          <div className="new-transaction-amount-input-container">
            <div className="new-transaction-currency">{trip.target_currency}</div>
            <input id="tactn-amount" type="text" maxLength="12" placeholder="How much did you pay?" name="amount" onChange={handleChange} value={formData.amount} />
          </div>
        </div>
        <div className="new-transaction-split-evenly-wrapper">
          {
            isAddingTransaction ?
              <button disabled onClick={splitEvenly} type="button" className="button-loading">Split Transaction Evenly</button> :
              <button onClick={splitEvenly} type="button">Split Transaction Evenly</button>
          }
        </div>
        <div className="new-transaction-preview">
          <div className="transaction-preview-header">Preview:</div>
          {
            tripMembers.map(member => {
              return (
                <div key={member.user_id} className="transaction-preview-row">
                  {
                    member.user_id === user.id ?
                      <span>You contribute: </span> :
                      <span>{member.username} contributes: </span>
                  }
                  <span className="transaction-split-input-wrapper">
                    <input type="text" value={splits[member.user_id]} onChange={(e) => handleSplitChange(member.user_id, e.target.value)} /> {trip.target_currency}
                  </span>
                </div>
              )
            })
          }
        </div>
        <div className="error-message">
          {error}
        </div>
        {
          isAddingTransaction ?
            <button disabled className="add-transaction-btn button-loading" type="submit">
              Creating Transaction...
            </button> :
            <button className="add-transaction-btn" type="submit">
              Create
            </button>
        }
      </form >
    </div >
  )
}

export default NewTransaction
