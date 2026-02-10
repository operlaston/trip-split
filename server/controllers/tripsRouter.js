const tripsRouter = require('express').Router()
const tripMembersRouter = require('./tripMembersRouter')
const transactionsRouter = require('./transactionsRouter')
const pool = require('../db')

// NOTE: next() is automatically called on error in express 5

// reroute requests about members to the corresponding router
tripsRouter.use("/:id/members", tripMembersRouter)

// reroute requests about transactions to the corresponding router
tripsRouter.use("/:id/transactions", transactionsRouter)

// get all for the asking user
tripsRouter.get("/", async (req, res) => {
  const userId = req.user.id

  const trips = await pool.query("\
    SELECT t.* FROM trips t \
    JOIN trip_members tm \
    ON t.id = tm.trip_id \
    WHERE tm.user_id = $1\
  ", [userId])
  res.json(trips.rows)
})

// get by id
tripsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const trip = await pool.query(" \
    SELECT * FROM trips \
    WHERE id = $1 \
    ", [id])
  if (trip.rowCount == 0) {
    return res.status(404).send('id doesnt exist');
  }
  res.json(trip.rows[0])
})

// create
tripsRouter.post("/", async (req, res, next) => {
  try {
    const { name, target_currency } = req.body

    await pool.query("BEGIN")

    const newTrip = await pool.query("\
      INSERT INTO trips \
      (name, target_currency) \
      VALUES ($1, $2) \
      RETURNING * \
      ", [name, target_currency])

    const tripId = newTrip.rows[0].id
    const userId = req.user.id

    const newTripMember = await pool.query("\
      INSERT INTO trip_members \
      (trip_id, user_id) \
      VALUES ($1, $2) \
      RETURNING * \
      ", [tripId, userId])

    await pool.query("COMMIT")

    res.status(201).json(newTrip.rows[0])
  }
  catch (err) {
    await pool.query("ROLLBACK")
    next(err)
  }
})

// lock
tripsRouter.put("/:id/lock", async (req, res) => {
  const id = req.params.id;
  const lockedTrip = await pool.query("\
    UPDATE trips \
    SET locked = true \
    RETURNING *\
    ")
  if (lockedTrip.rowCount == 0) {
    return res.status(404).send('id doesnt exist')
  }

  res.json(lockedTrip.rows[0])
})

// unlock
tripsRouter.put("/:id/unlock", async (req, res) => {
  const id = req.params.id;
  const unlockedTrip = await pool.query("\
    UPDATE trips \
    SET locked = false \
    RETURNING *\
    ")
  if (unlockedTrip.rowCount == 0) {
    return res.status(404).send('id doesnt exist')
  }

  res.json(unlockedTrip.rows[0])
})

// update
tripsRouter.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, target_currency } = req.body;
  const updatedTrip = await pool.query("\
    UPDATE trips \
    SET name = $1, target_currency = $2 \
    WHERE id = $3 \
    RETURNING * \
    ", [name, target_currency, id])
  if (updatedTrip.rowCount == 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.json(updatedTrip.rows[0])
})

// delete
tripsRouter.delete("/:id", async (req, res) => {
  const id = req.params.id
  const deletedTrip = await pool.query("\
    DELETE FROM trips \
    WHERE id = $1 \
    ", [id])
  if (deletedTrip.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.status(204).end()
})

module.exports = tripsRouter
