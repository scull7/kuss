
//eslint-disable-next-line max-len
//@see http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax

const { curry } = require('ramda')

const STATUS_CODE_ERROR     = 500
const STATUS_CODE_NOT_FOUND = 404

class CussError extends Error {
  constructor(message, status=STATUS_CODE_ERROR) {
    super(message)

    this.name    = this.constructor.name
    this.message = message
    this.status  = status

    Error.captureStackTrace(this, this.constructor)
  }
}


class TooManyRecords extends CussError {
  constructor(table, field, constraint, count) {
    const message = 'Too many records. '
      + `Found ${count} records in \`${table}\` `
      + `where \`${field}\` = "${constraint}"`

    super(message, STATUS_CODE_ERROR)
  }
}


class NotFound extends CussError {
  constructor(store, table, id) {
    const message = `Not Found - STORE: ${store} TABLE: ${table} ID: ${id}`
    super(message, STATUS_CODE_NOT_FOUND)
  }
}

NotFound.throw = curry((store, table, id) => {
  throw new NotFound(store, table, id)
})


// Stack Overflow: Use of apply with new operator is this possible?
// https://goo.gl/DbW7po
const throwCussError = (Type, ...args) => {
  throw new (Type.bind(Type, ...args))()
}


module.exports = {
  STATUS: {
    ERROR: STATUS_CODE_ERROR
  , NOT_FOUND: STATUS_CODE_NOT_FOUND
  }
, CussError
, TooManyRecords
, NotFound
, throwCussError
}
