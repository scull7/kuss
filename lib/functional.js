
const { create } = require('sanctuary')
const env        = require('./functional/types.js')

const checkTypes      = 'production' !== process.env.NODE_ENV
const F               = create({checkTypes, env})

module.exports = F
