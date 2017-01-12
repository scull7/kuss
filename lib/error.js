
//eslint-disable-next-line max-len
//@see http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax

const R = require('ramda')

const STATUS_CODE = {
  NOT_FOUND             : 404
, CONFLICT              : 409
, INTERNAL_SERVER_ERROR : 500
}

class KussError extends Error {
  constructor(message, status=STATUS_CODE.INTERNAL_SERVER_ERROR) {
    super(message)

    this.name    = this.constructor.name
    this.message = message
    this.status  = status

    Error.captureStackTrace(this, this.constructor)
  }
}


class TooManyRecords extends KussError {
  constructor(store, table, field, constraint, count) {
    const message = 'Too many records. '
      + `Found ${count} records in \`${store}\`.\`${table}\` `
      + `where \`${field}\` = "${constraint}"`

    super(message, STATUS_CODE.INTERNAL_SERVER_ERROR)
  }
}

TooManyRecords.throw = R.curry((store, table, field, constraint, count) => {
  throw new TooManyRecords(store, table, field, constraint, count)
})


class NotFound extends KussError {
  constructor(store, table, id) {
    const message = `Not Found - STORE: ${store} TABLE: ${table} ID: ${id}`
    super(message, STATUS_CODE.NOT_FOUND)
  }
}

NotFound.throw = R.curry((store, table, id) => {
  throw new NotFound(store, table, id)
})


class StorageConflict extends KussError {
  constructor(store, table, id) {
    const message = `Storage conflict - STORE: ${store} TABLE: ${table} `
                  + `ID: ${id}`
    super(message, STATUS_CODE.CONFLICT)
  }
}

StorageConflict.throw = R.curry((store, table, id) => {
  throw new StorageConflict(store, table, id)
})


module.exports = {
  STATUS_CODE
, KussError
, TooManyRecords
, NotFound
, StorageConflict
}
