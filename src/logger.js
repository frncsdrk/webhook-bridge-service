const config = require('config'),
  winston = require('winston')

const loggerConfig = config.get('service.server.logger')
module.exports = winston.createLogger({
  level: 'info',
  levels: winston.config.syslog.levels,
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: loggerConfig.logs_path + loggerConfig.error_log_file,
      level: 'error',
      timestamp: true
    }),
    new winston.transports.File({
      filename: loggerConfig.logs_path + loggerConfig.combined_log_file,
      timestamp: true
    })
  ]
})
