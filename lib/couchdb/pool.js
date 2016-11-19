
const R       = require('ramda')
const Pool    = require('generic-pool').Pool
const CouchDB = require('./index.js')


const DEFAULT_CONFIG = {
  max : 10
, min : 2
, idelTimeoutMillis : 30000
, log : false
, server : {
    url: 'http://localhost'
  , port: 5984
  , username: 'root'
  , password: ''
  }
}


const getServerConfig = R.compose(
  R.objOf('db_config')
, R.merge(DEFAULT_CONFIG.server)
, R.prop('server')
)


const connect = R.compose(CouchDB, getServerConfig)


const factoryFactory = (config = {}) => ({
  create: (cb) =>
    connect(config)

    .then((conn) => cb(null, conn))

    .catch(cb)

  // couchdb wrapper is just a configured request object.
, destroy: R.always(null)
})


const ConnectionPool = R.compose(
  (config) => new Pool(config)
, R.converge(R.merge, [ R.merge(DEFAULT_CONFIG), factoryFactory ])
, R.defaultTo({})
)


module.exports = ConnectionPool
