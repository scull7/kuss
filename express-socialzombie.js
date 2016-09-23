
const R                   = require('ramda')
const Request             = require('request')
const PluginFactory       = require('./lib/plugin-factory.js')
const SocialZombieClient  = require('./lib/socialzombie/client.js')


const DEFAULT_SZ_CONFIG = ({ url: 'http://127.0.0.1:3199' })


const DEFAULT_NAMESPACE = 'sz'

const NETWORKS = [
  'instagram'
]


// _isValidNetwork :: String -> Bool
const isValidNetwork = R.contains(R.__, NETWORKS)


// throwInvalidNetworkError :: Network -> Void : throws TypeError
const throwInvalidNetworkError = (network) => {
  throw new TypeError(`${network} is not a valid SocialZombie Network`)
}


// getTimelinePage :: Client -> String, String, String
// -> Promise ZombieTimeline
const getTimelinePage = (client) => (network, username, cursor) => {

  if (R.not(isValidNetwork(network)))
    throwInvalidNetworkError(network)

  let url = `/user/${network}/username/${username}/timeline`
  url += ( (cursor) ? `/${cursor}` : '' )

  return client.get(url)
}


// init :: Client -> SocialZombie
const init = R.applySpec({ getTimelinePage : getTimelinePage })


const Plugin = PluginFactory((config = DEFAULT_SZ_CONFIG) => {

  const namespace = R.propOr(DEFAULT_NAMESPACE, 'namespace', config)
  const client = Request.defaults({ baseUrl : config.url })
  const sz = init(SocialZombieClient(client))

  return (req, res, next) => {

    if (!req[namespace]) req[namespace] = sz

    return next()
  }
})


module.exports = Plugin
