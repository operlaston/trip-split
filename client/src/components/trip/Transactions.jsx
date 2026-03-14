import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { getTransactions } from "../../api/tripService"

const Transactions = () => {
  const { tripId } = useParams()
  const queryClient = useQueryClient()

  const trip = queryClient.getQueryData(['trip', tripId])
  const transactionsQuery = useQuery({
    queryKey: ['transactions', tripId],
    queryFn: () => getTransactions(tripId)
  })

  const transactions = []
  const transactionsExist = {}
  let numTransactions = 0
  transactionsQuery.data.forEach(t => {
    let tIndex = transactionsExist[t.transaction_id]
    if (tIndex === undefined) {
      transactions[numTransactions] = {
        payingUserId: t.paying_user_id,
        payingUsername: t.paying_user_username,
        amountPaid: t.amount_paid,
        currency: t.currency,
        createdAt: t.created_at,
        removed: t.removed,
        splits: []
      }
      transactionsExist[t.transaction_id] = numTransactions
      tIndex = numTransactions
      numTransactions++
    }
    transactions[tIndex].splits.push({
      amountOwed: t.amount_owed,
      owingUserId: t.owing_user_id,
      owingUsername: t.owing_user_username
    })
  })

  return (
    <>
      <h2>
        Transactions
      </h2>
      <div className="trip-transactions-wrapper">
        {
          numTransactions === 0
            ? <div>This trip does not yet have any transactions</div>
            :
            transactions.map(transaction => {
              const dateObj = new Date(transaction.createdAt);
              const dateCreated = dateObj.toDateString();
              return (
                <div className="trip-transaction">
                  <div>
                    {transaction.payingUsername} paid {transaction.amountPaid} {trip.target_currency} on
                    <span className="date-text"> {dateCreated}</span>
                  </div>
                  {
                    transaction.splits.map(s =>
                      s.owingUserId === transaction.payingUserId
                        ? ''
                        : <div>{s.owingUsername} owes {s.amountOwed} {trip.target_currency}</div>
                    )
                  }
                </div>
              )
            })
        }
      </div>
    </>
  )
}

export default Transactions
