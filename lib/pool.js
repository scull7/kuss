
const debug                = require('debug')('kuss:pool')
const R                    = require('ramda')
const Bluebird             = require('bluebird')
const GenericPool          = require('generic-pool')
const { FibonacciBackoff } = require('simple-backoff')

const CONFIG_PROP_SERVER    = 'server'
const CONFIG_PROP_VALIDATOR = 'validateAsync'
const CONFIG_PROP_TEST      = 'testOnBorrow'

const DEFAULT_CONFIG = {
  max               : 10
, min               : 2
, idleTimeoutMillis : 30000
, log               : false
, testOnBorrow      : false
, logger            : console
}


const shutdown = (pool) => () => pool.drain().then(() => pool.clear())


const getServerConfig = R.propOr({}, CONFIG_PROP_SERVER)


const addBackoff = (factory) => {
  const backoff   = new FibonacciBackoff()
  const orgCreate = factory.create

  const run = () => orgCreate().catch( e => new Bluebird((resolve, reject) => {
    const wait = backoff.next()

    debug('could not create resource - waiting %d ms - %s', wait, e.message)

    setTimeout(() => reject(e), wait)
  }))

  factory.create = run

  return factory

}


const buildFactory = (builder, default_config) => R.compose(
  addBackoff
, builder
, R.tap((cfg) => debug('factory builder configuration: %o', cfg))
, R.merge(default_config)
, R.tap((cfg) => debug('factory builder server configuration: %o', cfg))
, getServerConfig
)


const initPool       = (builder, default_config) => (config) => {
  const factory      = buildFactory(builder, default_config)(config)
  const hasValidator = R.always(R.has(CONFIG_PROP_VALIDATOR, factory))
  const pool_config  = R.compose(
    R.tap((cfg) => debug('Initializtion configuration: %o', cfg))
  , R.when(hasValidator, R.assoc(CONFIG_PROP_TEST, true))
  , R.merge(DEFAULT_CONFIG)
  )(config)

  const pool    = GenericPool.createPool(factory, pool_config)
  pool.shutdown = shutdown(pool)
  pool.logger   = pool_config.logger

  return pool
}


/*eslint-disable no-console*/
const watchErrors = (pool) => pool.on('factoryCreateError', (err) => {
  pool.logger.error(`Generic Pool Creation Error: ${err.message} - `, err)
  debug('Create resource error: %s - %o', err.message, err)
})
/*eslint-enable no-console*/



const create = (factoryBuilder, default_server_config = {}) => R.compose(
  R.tap(watchErrors)
, initPool(factoryBuilder, default_server_config)
, R.tap((cfg) => debug('User configuration: %o', cfg))
, R.defaultTo({})
)


module.exports = {
  create
}
