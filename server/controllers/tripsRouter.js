const tripsRouter = require('express').Router()
const pool = require('../db')

// NOTE: next() is automatically called on error in express 5

// get all
tripsRouter.get("/", async (req, res) => {
  const trips = await pool.query("SELECT * FROM trips")
  res.json(trips.rows)
})

// get by id
tripsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const trip = await pool.query(" \
    SELECT * FROM trips \
    WHERE trip_id = $1 \
    ", [id])
  if (trip.rowCount == 0) {
    return res.status(404).send('id doesnt exist');
  }
  res.json(trip.rows[0])
})

// create
tripsRouter.post("/", async (req, res) => {
  const { name, target_currency } = req.body
  const newTrip = await pool.query("\
    INSERT INTO trips \
    (name, target_currency) \
    VALUES ($1, $2) \
    RETURNING * \
    ", [name, target_currency])
  res.status(201).json(newTrip.rows[0])
})

// update
tripsRouter.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, target_currency } = req.body;
  const updatedTrip = await pool.query("\
    UPDATE trips \
    SET name = $1, target_currency = $2 \
    WHERE trip_id = $3 \
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
    WHERE trip_id = $1 \
    ", [id])
  if (deletedTrip.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.status(204).end()
  console.error(err)
  res.status(500).end()
})

module.exports = tripsRouter
