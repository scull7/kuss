/**
 * Kuss interface for Couchbase (cb)
 */

const R        = require('ramda')
const ID       = require('../identifier.js')
const Find     = require('./find.js')
const Bulk     = require('./bulk.js')

const {
  predicateToWhereEq
, projectionToSelect
, recordToSetClause
, selectAllClause
}              = require('./n1ql.js')

const {
  notFound
}              = require('./response.js')


const insert     = R.curry((cb, bucket, doc) => cb.insert(bucket, doc))


const getById    = R.curry((cb, bucket, id) =>
  cb.get(bucket, id)

  .then(R.prop('value'))
)


const getAll = R.curry((cb, bucket) =>
  cb.query(bucket, selectAllClause(cb, bucket), [])
)



const getByIdOrError = R.curry((cb, bucket, id) =>
  getById(cb, bucket, id)
  .tap(notFound(bucket, id))
)


const deleteById = R.curry((cb, bucket, id) =>
  getByIdOrError(cb, bucket, id)
  .then(() => cb.remove(bucket, id))
)


const update = R.curry((cb, bucket, id, params) =>
  getByIdOrError(cb, bucket, id)
  .then(R.merge(R.__, params))
  .then(doc => cb.upsert(bucket, id, doc))
  .then(ID.prop)
)


const updateWhereEq = R.curry((cb, bucket, predicates, record) => {

  const n1ql = `
    UPDATE \`${bucket}\`
    SET ${recordToSetClause(record)}
    WHERE ${predicateToWhereEq(predicates)}
    RETURNING \`${bucket}\`.id
  `

  return cb.query(bucket, n1ql, [])

})


const upsert = R.curry((cb, bucket, keys, doc) => R.composeP(
  insert(cb, bucket)
, R.ifElse(
    R.isEmpty
  , R.always(doc)
  , R.compose(R.merge(doc), R.head)
  )
, R.compose(
    Find.findWhereEq(cb, bucket)
  , R.objOf('predicates')
  , R.pickAll(keys)
  )
)(doc))


const projectAll = R.curry((cb, bucket, projection) =>
  cb.query(bucket, projectionToSelect(cb, bucket, projection), [])
)


module.exports = (cb) => ({
  insert        : insert(cb)
, update        : update(cb)
, updatewhereEq : updateWhereEq(cb)
, upsert        : upsert(cb)
, deleteById    : deleteById(cb)
, bulk_upsert   : Bulk.upsert(cb)
, getAll        : getAll(cb)
, getById       : getById(cb)
, projectAll    : projectAll(cb)
, findBy        : Find.findBy(cb)
, findOneBy     : Find.findOneBy(cb)
, findById      : Find.findById(cb)
, findWhereEq   : Find.findWhereEq(cb)
})
