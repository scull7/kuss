
const PluginFactory = require('./lib/plugin-factory.js')
const Couch         = require('./lib/couchdb')


const Plugin = PluginFactory(config =>

  (req, res, next) =>

    Couch(config)

    .then((couch) => {
      if (!req[config.namespace]) req[config.namespace] = couch
      return next()
    })

    .catch(next)

)


module.exports = Plugin
