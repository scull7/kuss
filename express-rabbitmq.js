
const R              = require('ramda')
const onFinished     = require('on-finished')
const PluginFactory  = require('./lib/plugin-factory.js')
const RabbitMQPool   = require('./lib/rabbitmq/pool.js')
const RabbitMQFacade = require('./lib/rabbitmq/facade.js')


const DEFAULT_NAMESPACE = 'rabbitmq'


const Plugin = PluginFactory((config) => {
  const namespace   = R.propOr(DEFAULT_NAMESPACE, 'namespace', config)
  const rabbit_pool = RabbitMQPool(config)

  process.on('SIGINT', rabbit_pool.shutdown)

  return (req, res, next) => {

    rabbit_pool.acquire()

    .then(conn => {

      if (!req[namespace]) req[namespace] = {
        publish     : RabbitMQFacade.publish(conn)
      , sendToQueue : RabbitMQFacade.sendToQueue(conn)
      }

      onFinished(res, () => { rabbit_pool.release(conn) })

      return next()

    })

    .catch(next)

  }

})


module.exports = Plugin
