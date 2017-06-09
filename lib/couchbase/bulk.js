
const R        = require('ramda')
const Bluebird = require('bluebird')
const uuid     = require('uuid/v4')
const ID       = require('../identifier.js')
const Find     = require('./find.js')


//:: Couchbase -> String -> Array String -> Promise Object
const findByKeys = R.curry((cb, bucket, keys) => R.compose(
  Find.findOneWhereEq(cb, bucket)
, (predicates) => ({ projection: '*', predicates: predicates })
, R.pick(keys)
))


//:: Couchbase -> String -> Array String -> (Object -> Promise Object | Object)
const findIfHasKeys = R.curry((cb, bucket, keys) => R.when(
  R.compose(R.not, R.isEmpty, R.pick(keys))
, findByKeys(keys)
))


//:: Promise Object -> Promise Object -> Promise Object
const mergePromises = R.composeP(R.apply(R.merge), R.unapply(Bluebird.all))


//:: Couchbase -> String -> Array String -> (Object -> Promise Object)
const findAndMerge = R.curry((cb, bucket, keys) => R.converge(mergePromises, [
  R.composeP(findIfHasKeys(keys), Bluebird.resolve)
, Bluebird.resolve
]))


//:: Array Promise -> Array any
const PromiseMap = R.curry(R.flip(Bluebird.map))


//:: Object -> Object
const setId = R.over(R.lensProp(ID.FIELD_NAME), uuid)


//:: Array Object -> String
const toUpsertN1ql = R.curry((bucket, docs) =>
  `UPSERT INTO \`${bucket}\` (KEY, VALUE) VALUES `
  + docs.map(doc => `(${doc.id}, ${JSON.stringify(doc)})`).join(', ')
  + ` RETURNING \`${bucket}\`.id`
)


//:: Couchbase -> String -> Array String -> Object -> Promise Array String
const upsert = R.curry((cb, bucket, keys, docs) => R.composeP(
  (n1ql) => cb.query(bucket, n1ql, [])
, toUpsertN1ql
, R.map(R.unless(R.has('id'), setId))
, PromiseMap(findAndMerge)
)(docs))


module.exports = { upsert }
