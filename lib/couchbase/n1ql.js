
/**
 * This is a collection of N1QL helper functions.
 */
const R = require('ramda')


//:: String -> boolean
const isSelectAll = R.equals('*')


// Predicate = { [string]: null|string|number }

// :: Predicate -> String
const  predicateToWhereEq = R.compose(
  R.join(' AND ')
, R.values
, R.mapObjIndexed(R.cond([
    [ R.equals(null), (v, k) => ` ${k} IS NULL ` ]
  , [ R.is(String), (v, k) => ` ${k} = "${v}" ` ]
  , [ R.T, (v, k) => ` ${k} = ${v} ` ]
  ]))
)


// Projection = [ String ]

//:: Couchbase -> String -> Projection -> String
const projectionToSelect = R.curry((cb, bucket, projection) => R.compose(
  (fields) => ` SELECT ${fields} from \`${bucket}\` `
, R.unless(isSelectAll, R.join(', '))
)(projection))


const recordToSetClause = R.compose(
  R.join(', ')
, R.values
, R.mapObjIndexed(R.cond([
    [ R.equals(null), (v, k) => ` ${k} = NULL ` ]
  , [ R.is(String), (v, k) => ` ${k} = "${v}" ` ]
  , [ R.T, (v, k) => ` ${k} = ${v} ` ]
  ]))
)


//:: Couchbase -> String -> String
const selectAllClause = (cb, bucket) => ` SELECT * FROM \`${bucket}\` `


// SordDirection = ASC | DESC
// Sort = { [string] : SortDirection }

//:: Sort -> String
const sortToOrderStatement = R.compose(
  R.join(' ')
, R.head
, R.toPairs
)


//:: [ Sort ] -> String
const sortArrayToOrderByClause = R.ifElse(
  R.either(R.isNil, R.isEmpty)
, R.always('')
, R.compose(
    R.concat(' ORDER BY ')
  , R.join(', ')
  , R.map(sortToOrderStatement)
  )
)


module.exports = {
  predicateToWhereEq
, projectionToSelect
, recordToSetClause
, selectAllClause
, sortArrayToOrderByClause
}
