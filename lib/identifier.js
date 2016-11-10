
const R = require('ramda')

const FIELD_NAME = 'id'


const has = R.has(FIELD_NAME)


const omit = R.omit([ FIELD_NAME ])


const prop = R.prop(FIELD_NAME)


module.exports = {
  FIELD_NAME : FIELD_NAME
, has        : has
, omit       : omit
, prop       : prop
}
