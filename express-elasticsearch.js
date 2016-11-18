
const R             = require('ramda')
const Bluebird      = require('bluebird')
const PluginFactory = require('./lib/plugin-factory.js')
const Elasticsearch = require('elasticsearch')


const DEFAULT_ES_CONFIG = {
  host: '127.0.0.1'
, port: 9200
}
const DEFAULT_NAMESPACE = 'es'


// Bluebird.defer() is deprecated
// https://github.com/elastic/elasticsearch-js/issues/431
const defer = () => {
  const _defer = {}
  _defer.promise = new Bluebird((resolve, reject) => {
    _defer.resolve = resolve
    _defer.reject  = reject
  })
  return _defer
}


const Plugin = PluginFactory((config = DEFAULT_ES_CONFIG) => {
  const namespace = R.propOr(DEFAULT_NAMESPACE, 'namespace', config)

  const es = new Elasticsearch.Client({
    host  : `${config.host}:${config.port}`
  , defer : defer
  })

  return (req, res, next) => {

    if (!req[namespace]) req[namespace] = es

    return next()
  }
})


module.exports = Plugin
