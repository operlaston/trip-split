const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./config')

const requestLogger = (req, res, next) => {
  console.log(req.method, req.path)
  console.log(req.body)
  console.log('----')
  next()
}

const unknownEndpoint = (req, res, next) => {
  const error = new Error(`Requested Route: ${req.originalUrl} doesn't exist`)
  error.isUnknownEndpoint = true
  next(error)
}

const errorHandler = (err, req, res, next) => {
  console.error(err)
  if (err.isUnknownEndpoint) {
    res.status(404).send(`Requested Route: ${req.originalUrl} doesn't exist`)
  }
  else if (err.code === '23505') {
    // UNIQUENESSS VIOLATION POSTGRESQL
    res.status(409).send(err.message)
  }
  else if (err.code === '23503') {
    // FOREIGN KEY DOESN'T EXIST IN PARENT TABLE
    res.status(409).send(err.message)
  }
  else if (err.code === '23502') {
    // NON-NULL VALUE REQUIRED BUT NULL VALUE FOUND
    res.status(409).send(err.message)
  }
  else if (err.name === 'JsonWebTokenError') {
    res.status(401).send('JsonWebTokenError: invalid token')
  }
  else if (err.name === 'TokenExpiredError') {
    res.status(401).send('token expired')
  }
  else {
    res.status(500).end()
  }
}

const verifyToken = (req, res, next) => {
  // don't need to verify token in development or test mode
  if (process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test') {
    req.user = { id: '1' }
    return next()
  }

  // retrieve authorization header
  const auth = req.get('Authorization')
  if (auth && auth.startsWith('Bearer')) {
    // Authorization: Bearer token
    const token = auth.slice(6).trim()
    const decodedToken = jwt.verify(token, JWT_SECRET)
    if (!decodedToken.id) {
      return res.status(401).send('invalid token')
    }
    req.user = { id: decodedToken.id }
    next()
  }
  else {
    res.status(401).send('no token given')
  }
}

module.exports = { requestLogger, unknownEndpoint, errorHandler, verifyToken }
