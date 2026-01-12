const express = require('express')
const app = express()
const cors = require('cors')
const tripsRouter = require('./controllers/tripsRouter')
const usersRouter = require('./controllers/usersRouter')
const middleware = require('./utils/middleware')

// middleware
app.use(cors())
app.use(express.json())
// app.use(middleware.requestLogger)

// routers
app.use('/trips', tripsRouter)
app.use('/users', usersRouter)

app.all(/.*/, middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
