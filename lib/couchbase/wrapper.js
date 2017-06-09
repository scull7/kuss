
const debug         = require('debug')('kuss:couchbase:wrapper')
const Bluebird      = require('bluebird')
const Pool          = require('./bucket-pool.js')
const uuid          = require('uuid/v4')
const { N1qlQuery } = require('couchbase')


const CONFIG_DEFAULT = {
  url: 'couchbase://localhost'
, pool: {
    min: 2
  , max: 10
  }
}


function add_handler(args, resolve, reject) {
  const handler = (err, result) => err ? reject(err) : resolve(result)
  return args.concat([ handler ])
}


function run (pool, bucket_name, method, ...rest) {

  debug("RUN - Bucket: %s, Method: %s, Params: %o", bucket_name, method, rest)

  return pool.acquire(bucket_name)

  .then(bucket => new Bluebird((resolve, reject) =>
    bucket[method](...add_handler(rest, resolve, reject))
  ))

  .tap(result => debug("RUN - Result: %o", result))
}


function getId(doc) {
  return doc.hasOwnProperty('id') ? doc.id : uuid()
}


const get = (pool, bucket_name, id) =>
  run(pool, bucket_name, 'get', id)


const insert = (pool, bucket_name, doc) =>
  run(pool, bucket_name, 'insert', getId(doc), doc)


const upsert = (pool, bucket_name, id, doc) =>
  run(pool, bucket_name, 'upsert', id, doc)


const remove = (pool, bucket_name, id) =>
  run(pool, bucket_name, 'remove', id)


const query = (pool, bucket_name, query_string, params) => {
  const n1ql = N1qlQuery.fromString(query_string)

  return run(pool, bucket_name, 'query', n1ql, params)
}



module.exports = function Wrapper(config = {}) {

  config.pool = Object.assign(CONFIG_DEFAULT.pool, config.pool)
  const pool  = Pool.createPool(Object.assign(CONFIG_DEFAULT, config))

  return {
    get: get.bind(null, pool)
  , insert: insert.bind(null, pool)
  , upsert: upsert.bind(null, pool)
  , remove: remove.bind(null, pool)
  , query: query.bind(null, pool)
  }

}
