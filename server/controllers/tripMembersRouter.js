const tripMembersRouter = require('express').Router({ mergeParams: true })
const pool = require('../db')

// get all members of a trip
tripMembersRouter.get('/', async (req, res) => {
  const tripId = req.params.id // refers to trip id

  // a user should only be able to see trip members
  // if they are part of the trip
  const response = await pool.query("\
    SELECT tm.user_id, tm.joined_at, u.name, u.username \
    FROM trip_members tm JOIN users u \
    ON u.id = tm.user_id \
    WHERE trip_id = $1 \
    ", [tripId])

  const userId = req.user.id
  let userInTrip = false
  for (const user of response.rows) {
    if (userId === user.user_id) {
      userInTrip = true
      break
    }
  }
  if (!userInTrip) {
    return res.status(401).send('users may only view members of own trips')
  }

  if (response.rowCount === 0) {
    return res.status(404).send('trip doesnt exist')
  }
  const members = response.rows
  res.json(members)
})

// add a member to a trip
tripMembersRouter.post('/', async (req, res) => {
  const tripId = req.params.id // refers to trip id
  const userId = req.user.id

  // first check if the trip is locked
  const checkLockedResponse = await pool.query("\
    SELECT locked from trips \
    WHERE id = $1\
    ", [tripId])

  if (checkLockedResponse.rowCount === 0) {
    return res.status(404).json('trip doesnt exist')
  }

  if (checkLockedResponse.rows[0].locked) {
    return res.status(401).json('trip is locked -- no new members may join')
  }

  const response = await pool.query("\
    INSERT INTO trip_members \
    (trip_id, user_id) \
    VALUES ($1, $2) \
    RETURNING * \
    ", [tripId, userId])
  res.status(201).json(response.rows[0])
})

// remove a member from a trip
tripMembersRouter.delete('/', async (req, res) => {
  try {
    const tripId = req.params.id
    const userId = req.user.id

    await pool.query("BEGIN")

    const deleteMemberRes = await pool.query("\
      DELETE FROM trip_members \
      WHERE trip_id = $1 \
      AND user_id = $2 \
      ", [tripId, userId])

    const selectRes = await pool.query("\
      SELECT * FROM trip_members \
      WHERE trip_id = $1 \
      ", [tripId])

    if (selectRes.rowCount === 0) {
      await pool.query("\
        DELETE FROM trips \
        WHERE id = $1 \
        ", [tripId])
    }

    await pool.query("COMMIT")

    if (deleteMemberRes.rowCount === 0) {
      return res.status(404).send('trip member doesnt exist')
    }
    res.status(204).end()
  }
  catch (err) {
    await pool.query("ROLLBACK")
    next(err)
  }
})

module.exports = tripMembersRouter
