const usersRouter = require('express').Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const saltRounds = 10

// NOTE: next() is automatically called on error in express 5

// get all users
usersRouter.get('/', async (req, res) => {
  const result = await pool.query("\
    SELECT id, username, name FROM users \
    ")
  res.json(result.rows)
})

// get user by id
usersRouter.get('/:id', async (req, res) => {
  const id = req.params.id
  const result = await pool.query("\
    SELECT id, username, name FROM users WHERE id = $1\
    ", [id])
  if (result.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  const user = result.rows[0]
  res.json(result.rows[0])
})

// update a user
usersRouter.put('/:id', async (req, res) => {
  const id = req.params.id

  // a user may only modify their own information
  if (id !== req.user.id) {
    return res.status(401).send('user may only modify itself')
  }

  const { name, username } = req.body
  const result = await pool.query("\
    UPDATE users \
    SET name = $1, username = $2 \
    WHERE id = $3 \
    RETURNING id, username, name \
    ", [name, username, id])
  if (result.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.json(result.rows[0])
})

// delete a user
usersRouter.delete('/:id', async (req, res) => {
  const id = req.params.id

  // a user may only delete itself
  if (id !== req.user.id) {
    return res.status(401).send('user may only delete itself')
  }

  const result = await pool.query("\
    DELETE FROM users WHERE id = $1 \
    ", [id])
  if (result.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.status(204).end()
})

module.exports = usersRouter
