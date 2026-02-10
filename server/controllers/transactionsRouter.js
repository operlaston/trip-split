const transactionsRouter = require('express').Router({ mergeParams: true })
const transactionSplitsRouter = require('./transactionSplitsRouter')
const pool = require('../db')

transactionsRouter.use('/:transactionId/splits', transactionSplitsRouter)

const isTripMember = async (tripId, userId) => {
  const response = await pool.query("\
    SELECT * FROM trip_members \
    WHERE trip_id = $1 AND user_id = $2\
    ", [tripId, userId])
  if (response.rowCount === 0) return false
  return true
}

// get all transactions for a trip
transactionsRouter.get('/', async (req, res) => {
  const tripId = req.params.id
  const userId = req.user.id

  let response = await pool.query("\
    SELECT * FROM transactions \
    WHERE trip_id = $1\
    ", [tripId])

  if (response.rowCount === 0) {
    return res.status(404).send('trip doesnt exist')
  }

  const isUserTripMember = await isTripMember(tripId, userId)
  if (!isUserTripMember) {
    return res.status(401).send('user is not a member of the trip for which the transaction is part of')
  }

  response = await pool.query("\
    SELECT t.id as transaction_id, t.trip_id, \
      u.id AS paying_user_id, u.name AS paying_user_name, \
      u.username AS paying_user_username, t.amount_paid, t.currency, \
      t.created_at AS transaction_created_at, t.removed \
    FROM transactions t \
    JOIN users u \
    ON t.paying_user = u.id \
    WHERE t.trip_id = $1\
    ", [tripId])

  res.json(response.rows)
})

// add a transaction and transaction splits for a trip
// request body: { amountPaid, currency, transactionSplits }
// transactionSplits is an array of { owingUser, amountOwed } objects
transactionsRouter.post('/', async (req, res) => {
  const tripId = req.params.id
  const userId = req.user.id

  // if a user is not part of a trip, they should not be
  // able to add transactions
  const checkUserResponse = await pool.query("\
    SELECT * FROM trip_members \
    WHERE trip_id = $1 AND user_id = $2\
    ", [tripId, userId])

  if (checkUserResponse.rowCount === 0) {
    return res.status(401).send(`user is not a member of trip with id ${tripId}`)
  }

  try {
    // transactionSplits is an array of objects
    // that contains the owingUser and the amountOwed
    const { amountPaid, currency, transactionSplits } = req.body

    // start transaction
    await pool.query("BEGIN")

    // create transaction
    const response = await pool.query("\
      INSERT INTO transactions \
      (trip_id, paying_user, amount_paid, currency, removed) \
      VALUES ($1, $2, $3, $4, $5) \
      RETURNING *\
      ", [tripId, userId, amountPaid, currency, false])

    const transactionId = response.rows[0].id

    // create splits
    let allSplits = []
    for (const split of transactionSplits) {
      const createSplitResponse = await pool.query("\
        INSERT INTO transaction_splits \
        (transaction_id, owing_user, amount_owed) \
        VALUES ($1, $2, $3) \
        RETURNING *\
        ", [transactionId, split.owingUser, split.amountOwed])

      allSplits.push(createSplitResponse.rows[0])
    }

    // commit/end transaction
    await pool.query("COMMIT")

    res.status(201).json({ transaction: response.rows[0], transactionSplits: allSplits })
  }
  catch (err) {
    await pool.query("ROLLBACK")
    next(err)
  }
})

// remove a transaction for a trip
transactionsRouter.delete('/:transactionId', async (req, res) => {
  const tripId = req.params.id
  const transactionId = req.params.transactionId

  // if a user is not part of a trip they should not be
  // able to remove a transaction in it
  const checkUserResponse = await pool.query("\
    SELECT * FROM trip_members \
    WHERE trip_id = $1 AND user_id = $2\
    ", [tripId, req.user.id])

  if (checkUserResponse.rowCount === 0) {
    return res.status(401).send(`user is not a member of trip with id ${tripId}`)
  }

  try {
    await pool.query("BEGIN")

    const response = await pool.query("\
      UPDATE transactions \
      SET removed = true \
      WHERE id = $1\
      RETURNING *\
      ", [transactionId])

    await pool.query("\
      DELETE FROM transaction_splits \
      WHERE transaction_id = $1\
      ", [transactionId])

    await pool.query("COMMIT")

    res.status(204).end()
  }
  catch (err) {
    await pool.query("ROLLBACK")
    next(err)
  }

})

module.exports = transactionsRouter
