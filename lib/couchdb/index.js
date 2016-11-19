
const R            = require('ramda')
const Bluebird     = require('bluebird')
const CouchWrapper = require('./wrapper.js')
const ID           = require('../identifier.js')
const Err          = require('../error.js')

const DEFAULT_OPTIONS = {}
const ONE             = 1


const hasOnlyOne = R.compose(R.equals(ONE), R.length)


const throwTooManyError = R.curry((bucket, prop, value, count) =>
  Err.throwCussError(Err.TooManyRecords, bucket, prop, value, count)
)


const propValueToPredicate = R.compose(R.objOf('predicates'), R.objOf)


const wrapProjection = R.compose(R.merge, R.objOf('projection'))


const getById = R.curry((couch, bucket, id) =>
  Bluebird.resolve(couch.get(bucket, id))
)


const getAll = R.curry((couch, bucket) =>
  Bluebird.resolve(couch.list(bucket, DEFAULT_OPTIONS))
)


const findWhereEq = R.curry((couch, bucket, query) => R.compose(
  Bluebird.resolve
, R.composeP(
    R.propOr([], 'docs')
  , (couch_query) => couch.query(bucket, couch_query, {})
)
, R.pickBy(R.compose(R.not, R.isNil))
, R.applySpec({
    fields: R.prop('projection')
  , selector: R.prop('predicates')
  , skip: R.prop('skip')
  , limit: R.prop('limit')
  , sort: R.prop('sort')
  })
)(query))


const insert = R.curry((couch, bucket, doc) =>R.composeP(
  Bluebird.resolve
, ID.prop
, R.ifElse(
    ID.has
  , R.converge(couch.create(bucket), [ ID.prop, ID.omit ])
  , couch.insert(bucket)
  )
)(doc))


const update = R.curry((couch, bucket, id, params) => R.composeP(
  Bluebird.resolve
, R.prop('id')
, couch.create(bucket, id)
, R.merge(params)
, R.tryCatch(
    getById(couch, bucket)
  , R.ifElse(
      R.propEq(Err.STATUS.NOT_FOUND, 'status')
    , Err.throwCussError.bind(null, Err.NotFound, bucket, id)
    , (e) => { throw e }
    )
  )
)(id))


const upsert = R.curry((couch, bucket, keys, doc) => R.composeP(
  R.compose(Bluebird.resolve, insert(couch, bucket))
, R.ifElse(
    R.isEmpty
  , R.always(doc)
  , R.compose(R.merge(doc), ID.prop, R.head)
  )
, R.compose(
    findWhereEq(couch, bucket)
  , R.objOf('predicates')
  , R.pickAll(keys)
)
)(doc))


const projectAll = R.curry((couch, bucket, projection) => R.composeP(
  R.project(projection)
, R.pluck('doc')
, R.propOr([], 'rows')
, getAll
)(couch, bucket))


const findBy = R.curry((couch, bucket, projection, prop, value) => R.composeP(
  findWhereEq(couch, bucket)
, wrapProjection(projection)
, R.compose(Bluebird.resolve, propValueToPredicate)
)(prop, value))


const findOneBy = R.curry((couch, bucket, projection, prop, value) =>
  R.composeP(
    R.ifElse(
      hasOnlyOne
    , R.head
    , R.compose(throwTooManyError(bucket, prop, value), R.length)
    )
  , findWhereEq(couch, bucket)
  , wrapProjection(projection)
  , R.compose(Bluebird.resolve, propValueToPredicate)
)(prop, value))


const findById = R.curry((couch, bucket, projection, id) => R.composeP(
  R.pick(projection)
, getById(couch)
)(bucket, id))


module.exports = ({ db_config }) =>

  CouchWrapper(db_config)

  .then((couch) => ({
    insert     : insert(couch)
  , update     : update(couch)
  , upsert     : upsert(couch)
  , getAll     : getAll(couch)
  , getById    : getById(couch)
  , projectAll : projectAll(couch)
  , findBy     : findBy(couch)
  , findOneBy  : findOneBy(couch)
  , findById   : findById(couch)
  , findWhereEq  : findWhereEq(couch)
  }))
