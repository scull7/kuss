
const R = require('ramda')

const CONTENT_TYPE_JSON   = 'application/json'
const CONTENT_TYPE_TEXT   = 'text/plain'
const CONTENT_TYPE_BUFFER = 'application/octet-stream'


const ALLOWED_OPTIONS = [
  'expiration' // (string) : expiration time in milliseconds
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


// bufferToString :: Buffer -> String
const bufferToString = (buf) => buf.toString()


const decoder = {
  [CONTENT_TYPE_JSON]   : R.compose(JSON.parse, bufferToString)
, [CONTENT_TYPE_TEXT]   : bufferToString
, [CONTENT_TYPE_BUFFER] : R.identity
}


const getByContentType = (hash) => R.ifElse(
  R.has(R.__, hash)
, R.prop(R.__, hash)
, (type) => { throw new Error(`Invalid Content-Type: ${type}`) }
)


const getContentType = R.ifElse(
  R.has('properties')
, R.path(['properties', 'contentType'])
, R.prop('contentType')
)


const transformContent = (type_hash) => R.converge(R.call, [
  R.compose(getByContentType(type_hash), getContentType)
, R.prop('content')
])


const encodeContent = transformContent(encoder)
const decodeContent = transformContent(decoder)


const getOptions = R.pick(ALLOWED_OPTIONS)


module.exports = {
  encodeContent
, decodeContent
, getOptions
, CONTENT_TYPE: {
    JSON: CONTENT_TYPE_JSON
  , TEXT: CONTENT_TYPE_TEXT
  , BUFFER: CONTENT_TYPE_BUFFER
  }
}
