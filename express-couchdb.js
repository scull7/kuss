
const R             = require('ramda')
const onFinished    = require('on-finished')
const PluginFactory = require('./lib/plugin-factory.js')
const CouchDBPool   = require('./lib/couchdb/pool.js')


const DEFAULT_NAMESPACE = 'couchdb'


const Plugin = PluginFactory(config => {
  const namespace  = R.propOr(DEFAULT_NAMESPACE, 'namespace', config)
  const couch_pool = CouchDBPool(config)

  process.on('SIGINT', couch_pool.shutdown)

  return (req, res, next) => {

    couch_pool.acquire()

    .then(conn => {

      if(!req[namespace]) req[namespace] = conn

      onFinished(res, () => { couch_pool.release(conn) })

      return next()

    })

    .catch(next)

  }

})


module.exports = Plugin
