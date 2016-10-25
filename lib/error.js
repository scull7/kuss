

//eslint-disable-next-line max-len
//@see http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax


const STATUS_CODE_ERROR = 500

class CussError extends Error {
  constructor(message, status=STATUS_CODE_ERROR) {
    super(message)

    this.name    = this.constructor.name
    this.message = message
    this.status  = status

    if ('function' === typeof Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)

    } else {
      this.stack = (new Error(message)).stack
    }
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


module.exports = {
  CussError
, TooManyRecords
}
