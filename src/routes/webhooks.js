const config = require('config'),
  express = require('express'),
  got = require('got')

const helpers = {
  errors: require('./../helpers/errors'),
  respond: require('./../helpers/respond')
}
const logger = require('./../logger')

const router = express.Router()

const validateIdPresent = (req, res, next) => {
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
}

router.post('/push', (req, res, next) => {
  // id must be present
  validateIdPresent(req, res, next)
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

  for (let i = 0; i < servicesConfig[serviceName].push_urls.length; i++) {
    const pushUrl = servicesConfig[serviceName].push_urls[i]
    got(
      pushUrl,
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
  }
})

module.exports = router
