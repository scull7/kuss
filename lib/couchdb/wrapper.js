

const R        = require('ramda')
const GotCouch = require('got-couch')


const DEFAULT_OPTIONS = {}


//@TODO wrap each method with a standard way of handling the
// raw driver response.


const find = R.curry((couch, bucket, query) =>
  couch.query(bucket, query, DEFAULT_OPTIONS)
)


const insert = R.curry((couch, bucket, doc) =>
  couch.insert(bucket, doc)
)


const create = R.curry((couch, bucket, id, doc) =>
  couch.create(bucket, id, doc)
)


const get = R.curry((couch, bucket, id) =>
  couch.get(bucket, id)
)


const list = R.curry((couch, bucket, params) =>
  couch.list(bucket, params)
)


module.exports = (config) => {
  const couch = GotCouch(config)

  return {
    query: find(couch)
  , insert: insert(couch)
  , create: create(couch)
  , get: get(couch)
  , list: list(couch)
  }
}
