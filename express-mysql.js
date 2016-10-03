
const R             = require('ramda')
const PluginFactory = require('./lib/plugin-factory.js')
const mysql2        = require('mysql2')
const MySqlStore    = require('./lib/mysql')

const DEFAULT_DB_CONFIG = {
  host: 'localhost'
, user: 'root'
, password: 'password'
}


function Connect({ namespace='mysql', db_config=DEFAULT_DB_CONFIG }) {

  const pool = mysql2.createPool(db_config)


  return (req, res, next) => {
    if (!req[namespace]) req[namespace] = pool

    return next()
  }
}


function Store({ namespace='DAO', connection_namespace='mysql' }) {

  return (req, res, next) => {
    const connection = req[connection_namespace]

    if (!connection) return next(new Error('MySql Connection Required'))

    if (!req[namespace]) req[namespace] = MySqlStore(connection)

    return next()
  }

}


const Plugin = PluginFactory(({ connection, store={} }) => {

  store.connection_namespace = R.prop('namespace', connection)

  const plugin_connect = Connect(connection)
  const plugin_store   = Store(store)

  return (req, res, next) => plugin_connect(req, res, (err) => err ?
    next(err) :
    plugin_store(req, res, next)
  )

})

Plugin.Store   = Store
Plugin.Connect = Connect


module.exports = Plugin

