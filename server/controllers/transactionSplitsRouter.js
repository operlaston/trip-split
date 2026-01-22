const transactionSplitsRouter = require('express').Router({ mergeParams: true })
const pool = require('../db')

transactionSplitsRouter.get('/', async (req, res) => {
  const transactionId = req.params.id

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
