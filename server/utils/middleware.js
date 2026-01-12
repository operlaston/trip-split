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
  if (err.isUnknownEndpoint) {
    res.status(404).send(`Requested Route: ${req.originalUrl} doesn't exist`)
  }
  else if (err.code === '23505') {
    // UNIQUENESSS VIOLATION POSTGRESQL
    res.status(409).send(err.message)
  }
  else if (err.name === 'JsonWebTokenError') {
    res.status(401).send('invalid token')
  }
  else if (err.name === 'TokenExpiredError') {
    res.status(401).send('token expired')
  }
  else {
    res.status(500).end()
  }
}

module.exports = { requestLogger, unknownEndpoint, errorHandler }
