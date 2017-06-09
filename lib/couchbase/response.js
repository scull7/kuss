
/**
 * A collection of Couchbase response helper functions.
 */
const R     = require('ramda')
const Err   = require('../error.js')


const STORE = 'couchbase'
const ONE   = 1


// Value = string | number | boolean


//:: String -> String -> Value
const maxOneRecord = R.curry((bucket, field, value) => R.compose(
  R.when(R.lt(ONE), Err.TooManyRecords.throw(STORE, bucket, field, value))
, R.length
))


const notFound = (bucket, id) =>
  R.when(R.isNil, () => Err.NotFound.throw(STORE, bucket, id))


module.exports = {
  maxOneRecord
, notFound
}
