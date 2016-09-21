
const R = require('ramda')

const Factory = (plugin) => {

  function Plugin(config) {
    return plugin(config)
  }
  Plugin.Translate = R.curry((translator, config) => R.compose(
    Plugin
  , translator
  )(config))

  return Plugin
}


module.exports = Factory

