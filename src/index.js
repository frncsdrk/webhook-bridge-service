const config = require('config'),
  got = require('got'),
  restify = require('restify')

const helpers = {
  errors: require('./helpers/errors'),
  respond: require('./helpers/respond')
}
const logger = require('./logger')

const server = restify.createServer()
const serverConfig = config.get('service.server')

server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser())

server.post('/push', (req, res, next) => {
  // id must be present
  if (!req.query.id) {
    const err = new helpers.errors.NoIdError()
    logger.log({
      level: 'error',
      message: err.message
    })
    return helpers.respond({
      err,
      next,
      res
    })
  }
  // verify service config exists
  const servicesConfig = config.get('service.services')
  const serviceName = req.query.id
  if (!servicesConfig[serviceName]) {
    const err = new helpers.errors.ServiceConfigNotFoundError(serviceName)
    logger.log({
      level: 'error',
      message: err.message
    })
    return helpers.respond({
      err,
      next,
      res
    })
  }
  // verify correct hash if configured
  if (servicesConfig[serviceName].hash) {
    if (servicesConfig[serviceName].hash !== req.query.hash) {
      const err = new helpers.errors.ServiceHashNotValidError(req.query.hash)
      logger.log({
        level: 'error',
        message: err.message
      })
      return helpers.respond({
        err,
        next,
        res
      })
    }
  }
  // verify req body is present
  if (!req.body) {
    const err = new helpers.errors.NoReqBodyError()
    logger.log({
      level: 'error',
      message: err.message
    })
    return helpers.respond({
      err,
      next,
      res
    })
  }
  // type branch, not tag
  if (
    servicesConfig[serviceName].branch && !servicesConfig[serviceName].tag &&
    req.body.push.changes[0].type === 'branch'
  ) {
    // validate branch name
    if (servicesConfig[serviceName].branch !== req.body.push.changes[0].new.name) {
      const message = 'recorded push on another branch'
      logger.log({
        level: 'info',
        message
      })
      return helpers.respond({
        data: {
          message
        },
        next,
        res
      })
    }
  }
  // got tag, but is not configured
  else if (
    !servicesConfig[serviceName].tag &&
    req.body.push.changes[0].type === 'tag'
  ) {
    const err = new helpers.errors.TypeNotConfiguredError('got tag, but is not defined')
    logger.log({
      level: 'err',
      message: err.message
    })
    return helpers.respond({
      err,
      next,
      res
    })
  }
  // validate type is configured
  else if (
    !servicesConfig[serviceName].tag && !servicesConfig[serviceName].branch
  ) {
    const err = new helpers.errors.TypeNotConfiguredError('no type configured')
    logger.log({
      level: 'err',
      message: err.message
    })
    return helpers.respond({
      err,
      next,
      res
    })
  }

  got(
    servicesConfig[serviceName].push_url,
    {
      method: 'POST',
      body: JSON.stringify({
        id: config.get('service.server.id'),
        hash: config.get('service.server.hash')
      })
    }
  )
    .then(res => {
      logger.log({
        level: 'info',
        message: res.statusCode + ' - ' + res.body
      })
      return helpers.respond({
        data: res.body,
        next,
        res
      })
    })
    .catch(err => {
      logger.log({
        level: 'error',
        message: err.message
      })
      return helpers.respond({
        err,
        next,
        res
      })
    })
})

server.get('/status', (req, res, next) => {
  return helpers.respond({
    data: {
      message: 'OK'
    },
    next,
    res
  })
})

server.listen(serverConfig.port, () => {
  console.log('%s listening at %s', server.name, server.url)
})
