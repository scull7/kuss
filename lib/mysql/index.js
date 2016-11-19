
const R         = require('ramda')
const { Query } = require('pimp-my-sql')
const Err       = require('../error.js')


const FIELD_ID  = 'id'


const withoutId = R.omit([FIELD_ID])


const escapeId = R.curry((mysql, id) => mysql.escapeId(id))


const toSetSqlStatement = R.curry((mysql, key) => {
  const escaped_id = escapeId(mysql, key)

  return `${escaped_id}=VALUES(${escaped_id})`
})


const paramsToUpdateList = R.curry((mysql, props, params) => R.compose(
  R.join(', ')
, R.map(toSetSqlStatement(mysql))
, R.keys
, R.pick(props)
)(params))


const projectionToSql = (mysql, table, projection) => R.compose(
  (fields) => ` SELECT ${fields} FROM ${escapeId(mysql, table)}`
, R.join(', ')
, R.map(escapeId(mysql))
)(projection)


const maxOneRecord = (table, field, value) => (results) => {
  //eslint-disable-next-line no-magic-numbers
  if (1 < results.length)
    throw new Err.TooManyRecords(table, field, value, results.length)
}


const selectAllFrom = (mysql, table) =>
  `SELECT * FROM ${escapeId(mysql, table)}`


const insert = Query.insert


const update = R.curry((mysql, table, id, params) =>
  Query.update(mysql, table, params, id).return(id)
)


// _predicatesToWhereEq :: Predicate -> String
const _predicateToWhereEq = R.compose(
  R.join(' AND ')
, R.values
, R.mapObjIndexed(R.cond([
    [ R.equals(null), (value, key) => `\`${key}\` IS NULL` ]
  , [ R.is(String), (value, key) => `\`${key}\` = '${value}'` ]
  , [ R.T, (value, key) => `\`${key}\` = ${value}` ]
  ]))
)


// _sortToOrderBy :: Sort -> String
const _sortToOrderBy = (_sort) => {
  if (R.either(R.isNil, R.isEmpty)(_sort)) return ''
  const key = R.compose(R.head, R.keys)(_sort)
  return `ORDER BY \`${key}\` ${_sort[key]}`
}


const updateWhereEq = R.curry((mysql, table, predicates, record) =>
  Query.updateWhere(mysql, table, _predicateToWhereEq(predicates), [], record)
)


const findWhereEq = R.curry((mysql, table, request) => {

  const sql = R.join(' ', [
    projectionToSql(mysql, table, request.projection)
  , `WHERE ${_predicateToWhereEq(request.predicates)}`
  , _sortToOrderBy(request.sort)
  , request.limit ? `LIMIT ${request.limit}` : ''
  , request.skip ? `OFFSET ${request.skip}` : ''
  ])

  return Query.select(mysql, sql, [])
})


const getIdForUpsert = R.curry((mysql, table, keys, params) =>
  Query.getWhereParams(
    mysql
  , table
  , R.omit(keys, params)
  , FIELD_ID
  )
  .then(R.compose(R.prop(FIELD_ID), R.head))
)


const upsert = R.curry((mysql, table, keys, params) => {

  const updates       = paramsToUpdateList(mysql, keys, params)
  const sql           = `INSERT INTO ${escapeId(mysql, table)} SET ? `
                      + `ON DUPLICATE KEY UPDATE ${updates}`
  const update_params = withoutId(params)

  return Query.runNoCache(mysql, sql, update_params)

  .then((response) => {

    if (response.insertId) return response.insertId

    if (response.affectedRows) {
      return getIdForUpsert(mysql, table, keys, params)
    }

    throw new Error(`Upsert Failed: ${sql}`)

  })

})


const getAll = R.curry((mysql, table) =>
  Query.select(mysql, selectAllFrom(mysql, table), [])
)


const getById = R.curry((mysql, table, id) => {
  const sql = selectAllFrom(mysql, table)
            + ' WHERE `id` = ? '

  return Query.select(mysql, sql, [ id ])

  .tap(maxOneRecord(table, FIELD_ID, id))

  .then(R.head)

})


const projectAll = R.curry((mysql, table, projection) =>
  Query.select(mysql, projectionToSql(mysql, table, projection), [])
)


const findBy = R.curry((mysql, table, projection, field, value) => {

  const sql = projectionToSql(mysql, table, projection)
            + ` WHERE ${escapeId(mysql, field)} = ? `

  return Query.select(mysql, sql, [ value ])

})


const findOneBy = R.curry((mysql, table, projection, field, value) =>
  findBy(mysql, table, projection, field, value)

  .tap(maxOneRecord(table, field, value))

  .then(R.head)
)


const findById = R.curry((mysql, table, projection, id) =>
  findOneBy(mysql, table, projection, FIELD_ID, id)
)


/** @TODO Query Routing
 * const query = R.curry((mysql, table, query_name, params) =>
 *   QueryRouter(table, query).then(fn) => fn(mysql, params))
 * )
 */


module.exports = (mysql) => ({
  insert        : insert(mysql)
, update        : update(mysql)
, updateWhereEq : updateWhereEq(mysql)
, upsert        : upsert(mysql)
, getAll        : getAll(mysql)
, getById       : getById(mysql)
, projectAll    : projectAll(mysql)
, findBy        : findBy(mysql)
, findOneBy     : findOneBy(mysql)
, findById      : findById(mysql)
, findWhereEq   : findWhereEq(mysql)
})
