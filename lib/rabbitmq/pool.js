
const R           = require('ramda')
const Pool        = require('../pool.js')
const amqplib     = require('amqplib')

const DEFAULT_CONFIG = {
  url: 'amqp://localhost'
, channelMax: 0
, heartbeat: 0
}


const connect = R.converge(amqplib.connect, [
  R.prop('url')
, R.pick(['channelMax', 'heartbeat'])
])


const factoryFactory = (config = {}) => ({
  create: () => connect(config)

, destroy: (conn) => conn.close()

})


module.exports = Pool.create(factoryFactory, DEFAULT_CONFIG)
