import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { getTransactions } from "../../api/tripService"

const Transactions = () => {
  const { tripId } = useParams()
  const queryClient = useQueryClient()

  const trip = queryClient.getQueryData(['trip', tripId])
  const transactionsQuery = useQuery({
    queryKey: ['transactions', tripId],
    queryFn: getTransactions
  })

  const transactions = transactionsQuery.data

  return (
    <>
      <h2>
        Transactions
      </h2>
      {
        transactions.length === 0
          ? <div>This trip does not yet have any transactions</div>
          :
          transactions.map(transaction => {
            const dateObj = new Date(transaction.created_at);
            const dateCreated = dateObj.toDateString();
            return (
              <div>
                {transaction.user_username} paid {transaction.amount_paid} {trip.target_currency} on
                <span className="date-text"> {dateCreated}</span>
              </div>
            )
          })
      }
    </>
  )
}

export default Transactions
