
const R              = require('ramda')
const Bluebird       = require('bluebird')

const SUCCESS_STATUS = 200


const _responseError  = (e) => {
  throw new Error(
   `Could not parse Social Zombie Message: ${e.message}`
  )
}


const _bodyIsString = R.compose(R.is(String), R.prop('body'))


const _parseBody = R.when(_bodyIsString, (response) => {
  try {
    return JSON.parse(response.body)
  }
  catch(err) {
    return JSON.parse(response.text)
  }
})


const _parseBodyAndSend = (resolve, reject, response) => {
  try {
    return resolve(_parseBody(response))
  }
  catch(e) {
    return reject(_responseError(e, response, new Error().stack))
  }
}


const _handleError = (reject, response) => {
  try {
    return reject(_parseBody(response))
  }
  catch(e) {
    return reject(_responseError(e, response, new Error().stack))
  }
}


const _callRequest = (client, options) => new Bluebird((resolve, reject) =>

  client(options, (err, response) => {

    if (err) {
      return reject(err)
    }

    if (response.statusCode === SUCCESS_STATUS) {
      return _parseBodyAndSend(resolve, reject, response)
    }

    return _handleError(reject, response)
  })
)


// anon :: ClientConfig -> Client
module.exports = (client) => ({

  // get :: String -> Query -> Promise JSONObject
  get: (path, query = {}) => {

    const clientConfig = {
      method: 'get'
    , url: path
    , qs: query
    }

    return _callRequest(client, clientConfig)
  }
})