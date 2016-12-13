
const R              = require('ramda')
const { renameProp } = require('../lib/util')


const FIELD_NAME = 'id'


const COUCH_FIELD_NAME = '_id'


const has = R.has(FIELD_NAME)


const omit = R.omit([ FIELD_NAME ])


const prop = R.prop(FIELD_NAME)


const couchify = renameProp(FIELD_NAME, COUCH_FIELD_NAME)


module.exports = {
  FIELD_NAME : FIELD_NAME
, has        : has
, omit       : omit
, prop       : prop
, couchify   : couchify
}
