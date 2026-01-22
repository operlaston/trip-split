const express = require('express')
const app = express()
const cors = require('cors')
const tripsRouter = require('./controllers/tripsRouter')
const usersRouter = require('./controllers/usersRouter')
const loginRouter = require('./controllers/loginRouter')
const signupRouter = require('./controllers/signupRouter')
const transactionSplitsRouter = require('./controllers/transactionSplitsRouter')
const middleware = require('./utils/middleware')

// middleware
app.use(cors())
app.use(express.json())
// app.use(middleware.requestLogger)

// login/signup (no jwt auth required)
app.use('/login', loginRouter)
app.use('/signup', signupRouter)

app.use(middleware.verifyToken)

// jwt auth required endpoints
app.use('/trips', tripsRouter)
app.use('/users', usersRouter)
app.use('/transactions/:id/splits', transactionSplitsRouter)

app.all(/.*/, middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
