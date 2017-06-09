
/**
 * An interface into the couchbase query system
 * that allows a user to specify a query using
 * the Kuss standard Request object.
 */

const R  = require('ramda')
const ID = require('../identifier.js')

const {
  predicateToWhereEq
, projectionToSelect
, sortArrayToOrderByClause
}        = require('./n1ql.js')

const {
  maxOneRecord
}        = require('./response.js')


// Value = string | number | boolean
// Projection = Array String


//:: Couchbase -> String -> Projection -> String -> Value
// -> Promise Array Object
const findBy = R.curry((cb, bucket, projection, field, value) => {

  const n1ql = projectionToSelect(cb, bucket, projection) + ' WHERE $1 = $2 '

  return cb.query(bucket, n1ql, [ field, value ])
})


//:: Couchbase -> String -> Projection -> String -> Value -> Promise Object
const findOneBy = R.curry((cb, bucket, projection, field, value) =>

  findBy(cb, bucket, projection, field, value)

  .tap(maxOneRecord(bucket, field, value))

  .then(R.head)
)


//:: Couchbase -> String -> Projection -> String -> Promise Object
const findById = R.curry((cb, bucket, projection, id) =>
  findOneBy(cb, bucket, ID.FIELD_NAME, id)
)



// Request =
//   { projection: Projection
//   , predicates: { [string]: Value }
//   , sort: Maybe Array Sort
//   , limit: Maybe number
//   , skip: Maybe number
//   }

//:: Couchbase -> String -> Request -> Promise Array Object
const findWhereEq = R.curry((cb, bucket, request) => {

  const n1ql = R.join(' ', [
    projectionToSelect(cb, bucket, request.projection)
  , ` WHERE ${predicateToWhereEq(request.predicates)} `
  , sortArrayToOrderByClause(request.sort)
  , request.limit ? ` LIMIT ${request.limit} ` : ''
  , request.skip ? ` OFFSET ${request.skip} ` : ''
  ])

  return cb.query(cb, bucket, n1ql, [])

})


const findOneWhereEq = R.curry((cb, bucket, request) => R.composeP(
  maxOneRecord
, findWhereEq(cb, bucket)
)(request))


module.exports = {
  findBy
, findById
, findOneBy
, findOneWhereEq
, findWhereEq
}
