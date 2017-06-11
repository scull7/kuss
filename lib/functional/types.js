
const { env } = require('sanctuary')
const $ = require('sanctuary-def')


const N1qlValue = $.NullaryType(
  'kuss/Value'
, 'https://github.com/influentialpublishers/kuss'
, x => null === x || 'number' === typeof x || 'string' === typeof x
)


module.exports = env.concat([
  N1qlValue
])
