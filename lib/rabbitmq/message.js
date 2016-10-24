
const R = require('ramda')

const CONTENT_TYPE_JSON   = 'application/json'
const CONTENT_TYPE_TEXT   = 'text/plain'
const CONTENT_TYPE_BUFFER = 'application/octet-stream'


const ALLOWED_OPTIONS = [
  'expriation' // (string) : expiration time in milliseconds
, 'userId' // (string)
, 'CC' // (string| Array string)
, 'BCC' // (string || Array string)
, 'priority' // (int)
, 'persistent' // (boolean)
, 'mandatory' // (boolean)
, 'contentType' // (string) : MIME type for the message content
, 'contentEncoding' // (string) : a MIME encoding for the message content
, 'headers' // (object)
, 'correlationId' // (string)
, 'replyTo' // (string)
, 'messageId' // (string)
, 'timestamp' // (int)
, 'type' // (string)
, 'appId' // (string)
]


const encoder = {
  [CONTENT_TYPE_JSON]   : R.compose(Buffer.from, JSON.stringify)
, [CONTENT_TYPE_TEXT]   : Buffer.from
, [CONTENT_TYPE_BUFFER] : R.identity
}


const getEncoderByContentType = R.ifElse(
  R.has(R.__, encoder)
, R.prop(R.__, encoder)
, (type) => { throw new Error(`Invalid Content-Type: ${type}`) }
)


const encodeContent = R.converge(R.call, [
  R.compose(getEncoderByContentType, R.prop('contentType'))
, R.prop('content')
])


const getOptions = R.pick(ALLOWED_OPTIONS)


module.exports = {
  encodeContent
, getOptions
}
