
/**
 * This is a collection of N1QL helper functions.
 */
const F = require('../functional.js')


//:: String -> boolean
const SELECT_ALL = '*'


//:: String -> (N1qlValue -> String) -> (StrMap N1qlValue -> String)
const specToQuery = (sep, fmt) =>
  F.pipe([ F.pairs, F.map(fmt), F.joinWith(sep) ])


//:: StrMap N1qlValue -> String
const predicateToWhereEq = specToQuery(
  ' AND '
, ([k, v]) => `${k} ${null === v ? 'IS NULL' : `${F.toString(v)}`}`
)


// Projection = [ String ]

//:: Couchbase -> String -> Projection -> String
const projectionToSelect = F.curry3((cb, bucket, projection) => F.pipe([
  x => SELECT_ALL === x ? F.Left('select all fields') : F.Right(x)
, F.map(F.joinWith(', '))
, F.map(fields => ` SELECT ${fields} FROM \`${bucket}\` `)
, F.fromEither(SELECT_ALL)
])(projection))


const recordToSetClause = specToQuery(
  ', '
, ([k, v]) => `${k} = ${null === v ? 'NULL' : `${F.toString(v)}`}`
)


//:: Couchbase -> String -> String
const selectAllClause = (cb, bucket) => ` SELECT * FROM \`${bucket}\` `


// SordDirection = ASC | DESC
// Sort = { [string] : SortDirection }

//:: Sort -> String
const sortToOrderStatement = F.pipe([
  F.pairs
, F.head
, F.map(F.joinWith(' '))
])


//:: [ Sort ] -> String
const sortArrayToOrderByClause = F.pipe([
  F.toMaybe
, F.fromMaybe
, F.mapMaybe(sortToOrderStatement)
, F.joinWith(', ')
])


module.exports = {
  predicateToWhereEq
, projectionToSelect
, recordToSetClause
, selectAllClause
, sortArrayToOrderByClause
}
