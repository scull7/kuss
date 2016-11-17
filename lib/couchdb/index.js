
const R            = require('ramda')
const Bluebird     = require('bluebird')
const CouchWrapper = require('./wrapper.js')
const ID           = require('../identifier.js')

const KEY_FIELDS      = 'fields'
const KEY_SELECTOR    = 'selector'
const DEFAULT_OPTIONS = {}


const projectionMerge = R.compose(R.merge, R.objOf(KEY_FIELDS))


const isArray = R.is(Array)


const findWhere = R.curry((couch, bucket, projection, keys, values) =>
  R.compose(
    (query) => couch.query(bucket, query, {})
  , R.when(R.always(isArray(projection)), projectionMerge(projection))
  , R.objOf(KEY_SELECTOR)
  , R.zipObj
  )(keys, values)
)


const insert = R.curry((couch, bucket, doc) =>R.composeP(
  ID.prop
, R.ifElse(
    ID.has
  , R.converge(couch.create(bucket), [ ID.prop, ID.omit ])
  , couch.insert(bucket)
  )
)(doc))


// @TODO - implement update method
const update = () => () => { throw new Error('Not Implemented') }


const upsert = R.curry((couch, bucket, keys, doc) => R.composeP(
  insert(couch, bucket)
, R.ifElse(
    R.isEmpty
  , R.always(doc)
  , R.compose(R.merge(doc), ID.prop)
  )
, R.prop('docs')
, findWhere(couch, bucket, null, keys)
, R.compose(Bluebird.resolve, R.pickAll(keys))
)(doc))


const getAll = R.curry((couch, bucket) =>
  couch.list(bucket, DEFAULT_OPTIONS)
)


const getById = R.curry((couch, bucket, id) =>
  couch.get(bucket, id)
)


// @TODO - implement projectAll method
const projectAll = () => () => { throw new Error('Not Implemented') }


// @TODO - implement findBy method
const findBy = () => () => { throw new Error('Not Implemented') }


// @TODO - implement findOneBy method
const findOneBy = () => () => { throw new Error('Not Implemented') }


// @TODO - implement findById method
const findById = () => () => { throw new Error('Not Implemented') }


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
  , findWhere  : findWhere(couch)
  }))
