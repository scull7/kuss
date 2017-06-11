
const debug         = require('debug')('kuss:couchbase:wrapper')
const Bluebird      = require('bluebird')
const Pool          = require('./bucket-pool.js')
const uuid          = require('uuid/v4')
const { N1qlQuery } = require('couchbase')


const CONFIG_DEFAULT = {
  url: 'couchbase://localhost'
, username: 'Administrator'
, password: 'password'
, pool: {
    min: 2
  , max: 10
  }
}


function add_handler(args, resolve, reject) {
  const handler = (err, result) => err ? reject(err) : resolve(result)
  return args.concat([ handler ])
}


function run(name, acquire, pool, bucket_name, method, ...rest) {

  debug(
    "%s - Bucket: %s, Method: %s, Params: %o"
  , name
  , bucket_name
  , method
  , rest
  )

  return acquire(pool, bucket_name)

  .then(actor => new Bluebird((resolve, reject) => {

    const args = add_handler(rest, resolve, reject)

    debug("%s - Arguments; %o", name, args)

    return actor[method](...args)

  }))

  .tap(result => debug("%s - Method: %s, Result: %o", name, method, result))

  .catch(err => {

    debug("%s - Method: %s, ERROR: %o", name, method, err)

    throw err

  })

}


const Bucket = run.bind(null, "bucket", (pool, name) => pool.acquire(name))


const Manager = run.bind(null, "manager", (pool, name) =>
  pool.acquire(name).then(bucket => bucket.manager())
)


function getId(doc) {
  return doc.hasOwnProperty('id') ? doc.id : uuid()
}


const get = (pool, bucket_name, id) =>
  Bucket(pool, bucket_name, 'get', id)


const insert = (pool, bucket_name, doc) => {
  const id = getId(doc)

  return Bucket(pool, bucket_name, 'insert', id, doc)

  .tap(res => { res.id = id })
}


const upsert = (pool, bucket_name, id, doc) =>
  Bucket(pool, bucket_name, 'upsert', id, doc)


const remove = (pool, bucket_name, id) =>
  Bucket(pool, bucket_name, 'remove', id)


const query = (pool, bucket_name, query_string, params) => {
  const n1ql = N1qlQuery.fromString(query_string)

  return Bucket(pool, bucket_name, 'query', n1ql, params)
}


const truncate = (pool, bucket_name) => Manager(pool, bucket_name, 'flush')


module.exports = function Wrapper(config = {}) {

  config.pool = Object.assign(CONFIG_DEFAULT.pool, config.pool)
  const pool  = Pool.createPool(Object.assign(CONFIG_DEFAULT, config))

  return {
    get: get.bind(null, pool)
  , insert: insert.bind(null, pool)
  , upsert: upsert.bind(null, pool)
  , remove: remove.bind(null, pool)
  , query: query.bind(null, pool)
  , truncate: truncate.bind(null, pool)
  }

}
