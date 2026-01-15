const loginRouter = require('express').Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')

// login
loginRouter.post('/', async (req, res) => {
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
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 3600 })
  res.status(200).json({ token, username: user.username, name: user.name, id: user.id })
})

module.exports = loginRouter
