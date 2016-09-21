

//@see http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax

class CussError extends Error {
  constructor(message, status=500) {
    super(message)

    this.name    = this.constructor.name;
    this.message = message;
    this.status  = status;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);

    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}


class TooManyRecords extends CussError {
  constructor(table, field, constraint, count) {
    const message = 'Too many records. '
      + `Found ${count} records in \`${table}\` `
      + `where \`${field}\` = "${constraint}"`

    super(message, 500);
  }
}


module.exports = {
  CussError
, TooManyRecords
}
