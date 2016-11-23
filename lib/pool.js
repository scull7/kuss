
const debug                = require('debug')('kuss:pool')
const R                    = require('ramda')
const Bluebird             = require('bluebird')
const GenericPool          = require('generic-pool')
const { FibonacciBackoff } = require('simple-backoff')

const CONFIG_PROP_SERVER    = 'server'
const CONFIG_PROP_VALIDATOR = 'validate'
const CONFIG_PROP_TEST      = 'testOnBorrow'

const EVENT_CREATE_ERROR    = 'factoryCreateError'

const DEFAULT_CONFIG = {
  max               : 10
, min               : 2
, idleTimeoutMillis : 30000
, log               : false
, testOnBorrow      : false
, logger            : console
}


function _addBackoff(factory) {
  const backoff              = new FibonacciBackoff()
  const originalCreateMethod = factory.create

  factory.create = function __run() {

    return originalCreateMethod().catch(function ___handleCreateError(e) {

      const wait = backoff.next()

      debug(
        '::_addBackoff - could not create resource - waiting %d ms - %s'
      , wait
      , e.message
      )

      return Bluebird.delay(wait).throw(e)

    })

  }

  return factory

}


function _buildPoolConfig(factory, user_config) {
  const pool_config   = R.merge(DEFAULT_CONFIG, user_config)

  if (R.has(CONFIG_PROP_VALIDATOR, factory)) {
    pool_config[CONFIG_PROP_TEST] = true
  }

  debug('::_buildPoolConfig - configuration: %o', pool_config)

  return pool_config
}


function _buildFactory(builder, default_config, user_config) {
  const server_config = R.propOr({}, CONFIG_PROP_SERVER, user_config)
  const config        = R.merge(default_config, server_config)

  debug('::_buildFactory - server configuration: %o', server_config)
  debug('::_buildFactory - merged  configuration: %o', config)

  return _addBackoff( builder(config) )
}


function _initPool(builder, default_config, user_config) {
  const factory      = _buildFactory(builder, default_config, user_config)
  const pool_config  = _buildPoolConfig(factory, user_config)

  const pool    = GenericPool.createPool(factory, pool_config)
  pool.logger   = pool_config.logger

  pool.shutdown = function __shutdown() {
    return pool.drain().then(() => pool.clear())
  }

  pool.on(EVENT_CREATE_ERROR, function __poolResourceCreateError(err) {
    pool.logger.error(`Generic Pool Creation Error: ${err.message} - `, err)
    debug('::initPool - Create resource error: %s - %o', err.message, err)
  })

  return pool
}


function create(factoryBuilder, default_server_config = {}) {

  return function __createPool(user_config = {}) {
    debug('::create - user configuration: %o', user_config)

    return _initPool(factoryBuilder, default_server_config, user_config)
  }

}


module.exports = {
  create
}
