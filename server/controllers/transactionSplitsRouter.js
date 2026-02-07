const transactionSplitsRouter = require('express').Router({ mergeParams: true })
const pool = require('../db')

const isTripMember = async (tripId, userId) => {
  const response = await pool.query("\
    SELECT * FROM trip_members \
    WHERE trip_id = $1 AND user_id = $2\
    ", [tripId, userId])
  if (response.rowCount === 0) return false
  return true
}

transactionSplitsRouter.get('/', async (req, res) => {
  const transactionId = req.params.transactionId
  const tripId = req.params.id
  const userId = req.user.id

  const isUserTripMember = await isTripMember(tripId, userId)
  if (!isUserTripMember) {
    return res.status(401).send('user is not a member of the trip for which the transaction is part of')
  }

  const getSplitsResponse = await pool.query("\
    SELECT ts.transaction_id, ts.amount_owed, u.id as owing_user_id, u.username as owing_user_username, u.name as owing_user_name \
    FROM transaction_splits ts \
    JOIN users u \
    ON ts.owing_user = u.id \
    WHERE ts.transaction_id = $1\
    ", [transactionId])

  if (getSplitsResponse.rowCount === 0) {
    return res.status(404).send('either the transaction id doesnt exist, or the transaction has been removed')
  }

  res.json(getSplitsResponse.rows)
})

module.exports = transactionSplitsRouter
