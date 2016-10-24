
const R       = require('ramda')
const Pool    = require('generic-pool').Pool
const amqplib = require('amqplib')


const DEFAULT_CONFIG = {
  max               : 10
, min               : 2
, idleTimeoutMillis : 30000
, log               : false
, server            : {
    url: 'amqp://localhost'
  , channelMax: 0
  , heartbeat: 0
  }
}


const getServerConfig = R.compose(
  R.merge(DEFAULT_CONFIG.server)
, R.prop('server')
)


const connect = R.compose(
  R.converge(amqplib.connect, [
    R.prop('url')
  , R.pick(['channelMax', 'heartbeat'])
  ])
, getServerConfig
)


const factoryFactory = (config = {}) => ({
  create: (cb) =>
    connect(config)

    .then((conn) => cb(null, conn))

    .catch(cb)

, destroy: (conn) => conn.close()

})


const ConnectionPool = R.compose(
  (config) => new Pool(config)
, R.converge(R.merge, [ R.merge(DEFAULT_CONFIG), factoryFactory ])
, R.defaultTo({})
)


module.exports = ConnectionPool
