
const R      = require('ramda')
const Status = require('./status.js')


const RAW         = 'raw'
const BODY        = 'body'
const STATUS_CODE = 'statusCode'


const getBody = R.prop(BODY)


const getStatusCode = R.path([ RAW, STATUS_CODE ])


const isOk = R.compose(Status.isSuccess, getStatusCode)


module.exports = {
  isOk: isOk
, getBody: getBody
, getStatusCode: getStatusCode
}
