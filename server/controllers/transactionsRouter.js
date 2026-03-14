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

  // let response = await pool.query("\
  //   SELECT * FROM transactions \
  //   WHERE trip_id = $1\
  //   ", [tripId])

  // if (response.rowCount === 0) {
  //   return res.status(404).send('trip doesnt exist')
  // }

  const isUserTripMember = await isTripMember(tripId, userId)
  if (!isUserTripMember) {
    return res.status(403).send('user is not a member of the trip for which the transaction is part of')
  }

  response = await pool.query("\
    SELECT t.id as transaction_id, t.trip_id, \
      u.id AS user_id, \
      u.username AS user_username, t.amount_paid, t.currency, \
      t.created_at AS created_at, t.removed \
    FROM transactions t \
    JOIN users u \
    ON t.paying_user = u.id \
    WHERE t.trip_id = $1\
    ", [tripId])

  const getSplitsResponse = await pool.query("\
    SELECT ts.transaction_id, ts.amount_owed, u.id as owing_user_id, u.username as owing_user_username, u.name as owing_user_name \
    FROM transaction_splits ts \
    JOIN users u \
    ON ts.owing_user = u.id \
    WHERE ts.transaction_id = $1\
    ", [transactionId])

  res.json(response.rows)
})

// add a transaction and transaction splits for a trip
// request body: { payingUser, amountPaid, description, transactionSplits }
// transactionSplits is an array of { owingUser, amountOwed } objects
transactionsRouter.post('/', async (req, res, next) => {
  const tripId = req.params.id
  const userId = req.user.id

  // if a user is not part of a trip, they should not be
  // able to add transactions
  const checkUserResponse = await pool.query("\
    SELECT * FROM trip_members \
    WHERE trip_id = $1 AND user_id = $2\
    ", [tripId, userId])

  if (checkUserResponse.rowCount === 0) {
    return res.status(403).send(`user is not a member of trip with id ${tripId}`)
  }

  try {
    // transactionSplits is an array of objects
    // that contains the owingUser and the amountOwed
    const { payingUser, amountPaid, description, transactionSplits } = req.body

    // start transaction
    await pool.query("BEGIN")

    // create transaction
    const response = await pool.query("\
      INSERT INTO transactions \
      (trip_id, paying_user, amount_paid, description) \
      VALUES ($1, $2, $3, $4) \
      RETURNING *\
      ", [tripId, payingUser, amountPaid, description])

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
transactionsRouter.delete('/:transactionId', async (req, res, next) => {
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

// get all transactions AND transaction splits for a trip
transactionsRouter.get('/splits', async (req, res) => {
  const tripId = req.params.id
  const userId = req.user.id

  const isUserTripMember = await isTripMember(tripId, userId)
  if (!isUserTripMember) {
    return res.status(403).send('user is not a member of the trip for which the transaction is part of')
  }

  response = await pool.query("\
    SELECT t.id as transaction_id, \
      u1.id AS paying_user_id, \
      u1.username AS paying_user_username, t.amount_paid, t.currency, \
      t.created_at AS created_at, t.removed, ts.amount_owed, \
      u2.id AS owing_user_id, u2.username AS owing_user_username \
    FROM transactions t \
    JOIN users u1 \
    ON t.paying_user = u1.id \
    JOIN transaction_splits ts \
    ON t.id = ts.transaction_id \
    JOIN users u2 \
    ON u2.id = ts.owing_user \
    WHERE t.trip_id = $1\
    ", [tripId])

  res.json(response.rows)
})

module.exports = transactionsRouter
