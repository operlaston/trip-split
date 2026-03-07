import { api } from "./api"


export const createTransaction = async ({ tripId, newTransaction }) => {
  const { payingUser, amountPaid, description, transactionSplits } = newTransaction
  const response = await api.post(`/trips/${tripId}/transactions`, {
    payingUser,
    amountPaid,
    description,
    transactionSplits
  })
  return response.data
}
