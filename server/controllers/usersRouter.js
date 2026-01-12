const usersRouter = require('express').Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')

// NOTE: next() is automatically called on error in express 5

// get all users
usersRouter.get('/', async (req, res) => {
  const result = await pool.query("\
    SELECT * FROM users \
    ")
  res.json(result.rows)
})

// get user by id
usersRouter.get('/:id', async (req, res) => {
  const id = req.params.id
  const result = await pool.query("\
    SELECT * FROM users WHERE user_id = $1\
    ", [id])
  if (result.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.json(result.rows[0])
})

// create a user
usersRouter.post('/', async (req, res) => {
  const { name, username, password } = req.body
  const password_hash = await bcrypt.hash(password, saltRounds)
  const result = await pool.query("\
    INSERT INTO users \
    (name, username, password_hash) \
    VALUES ($1, $2, $3) \
    RETURNING * \
    ", [name, username, password_hash])
  res.status(201).json(result.rows[0])
})

// update a user
usersRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const { name, username } = req.body
  const result = await pool.query("\
    UPDATE users \
    SET name = $1, username = $2 \
    WHERE user_id = $3 \
    RETURNING * \
    ", [name, username, id])
  if (result.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.json(result.rows[0])
})

// delete a user
usersRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  const result = await pool.query("\
    DELETE FROM users WHERE user_id = $1 \
    ", [id])
  if (result.rowCount === 0) {
    return res.status(404).send('id doesnt exist')
  }
  res.status(204).end()
})

// login
usersRouter.post('/login', async (req, res) => {
  const { username, password } = req.body
  const result = await pool.query("\
    SELECT * FROM users \
    WHERE username = $1 \
    ", [username])
  if (result.rowCount === 0) {
    return res.status(404).send('username doesnt exist')
  }
  const user = result.rows[0]
  const passwordCorrect = await bcrypt.compare(password, user.password_hash)
  if (!passwordCorrect) {
    return res.status(401).send('incorrect password')
  }

  // token expires in an hour
  const token = jwt.sign(user.user_id, JWT_SECRET, { expiresIn: 3600 })
  res.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = usersRouter
