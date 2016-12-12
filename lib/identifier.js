
const R              = require('ramda')
const { renameProp } = require('../lib/util')

const FIELD_NAME = 'id'


const has = R.has(FIELD_NAME)


const omit = R.omit([ FIELD_NAME ])


const prop = R.prop(FIELD_NAME)


const couchify = renameProp('id', '_id')


module.exports = {
  FIELD_NAME : FIELD_NAME
, has        : has
, omit       : omit
, prop       : prop
, couchify   : couchify
}
