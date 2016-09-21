
const R             = require('ramda')
const PluginFactory = require('./lib/plugin-factory.js')
const RabbitMQ      = require('./lib/rabbitmq/factory.js')


const DEFAULT_NAMESPACE = 'rabbitmq'


const Plugin = PluginFactory((config) => {
  const namespace = R.propOr(DEFAULT_NAMESPACE, 'namespace', config)
  const rabbitmq  = RabbitMQ(config)

  return (req, res, next) => {

    if (!req[namespace]) req[namespace] = rabbitmq

    return next()

  }

})


module.exports = Plugin
