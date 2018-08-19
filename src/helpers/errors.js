const NoIdError = function (msg) {
  return new Error('NoIdError ' + msg)
}

const NoReqBodyError = function (msg) {
  return new Error('NoReqBodyError ' + msg)
}

const ServiceConfigNotFoundError = function (msg) {
  return new Error('ServiceConfigNotFoundError ' + msg)
}

const ServiceHashNotValidError = function (msg) {
  return new Error('ServiceHashNotValidError ' + msg)
}

const TypeNotConfiguredError = function (msg) {
  return new Error('TypeNotConfiguredError ' + msg)
}

module.exports = {
  NoIdError,
  NoReqBodyError,
  ServiceConfigNotFoundError,
  ServiceHashNotValidError,
  TypeNotConfiguredError
}
