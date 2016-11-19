
const R = require('ramda')
const Response = require('./response.js')


const PROP_ERROR = 'error'
const DEFAULT_MESSAGE = 'Generic CouchDB Error'


const hasError = R.both( R.is(Object), R.has(PROP_ERROR))


const getError = R.ifElse(
  hasError
, R.prop(PROP_ERROR)
, R.always(DEFAULT_MESSAGE)
)


function CouchDBError(response) {

  this.name     = 'CouchDBError'
  this.message  = getError(response)
  this.response = Response.getBody(response)
  this.status   = Response.getStatusCode(response)
  this.stack = (new Error()).stack

}
CouchDBError.prototype = Object.create(Error.prototype)
CouchDBError.prototype.constructor = CouchDBError


CouchDBError.throw = (res) => { throw new CouchDBError(res) }


module.exports = CouchDBError
