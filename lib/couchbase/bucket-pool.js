/**
 * This is a caching bucket pool.  We don't want to open a new
 * connection to a bucket each time, so we will use the generic-pool
 * library to create individual connection pools for each bucket.
 */

const Bluebird    = require('bluebird')
const GenericPool = require('generic-pool')
const couchbase   = require('couchbase')


function createBucket(config, bucket_name) {

  const  cluster = new couchbase.cluster(config.url)
  const bucket  = cluster.openBucket(bucket_name)

  return Bluebird.resolve(bucket)

}


function closeBucket(bucket) {

  return Bluebird.resolve(bucket.disconnect())

}


function PoolOfPools(config) {

  const pools = {}

  function hasNamedPool(name) {
    return pools.hasOwnProperty(name)
  }


  function getNamedPool(name) {
    if (!hasNamedPool(name)) {
      throw new Error("Unknown Pool: " + name)
    }

    return pools[name]
  }

  function createNamedPool(name) {

    const factory = {
      create: createBucket.bind(null, config, name)
    , destroy: closeBucket
    }
    pools[name] = GenericPool.createPool(factory, config.pool)

    return pools[name]

  }


  function drainPool() {

    return Bluebird.all(pools.map(p => p.drain()))
      .then(() => pools.map(p => p.clear()))

  }

  return {
    has    : hasNamedPool
  , get    : getNamedPool
  , create : createNamedPool
  , drain  : drainPool
  }

}


function acquire(pool_of_pools, bucket_name) {

  pool_of_pools.has(bucket_name) ?
    pool_of_pools.get(bucket_name).acquire() :
    pool_of_pools.create(bucket_name).acquire()

}


function drain(pool_of_pools) {

  return pool_of_pools.drain()

}


function createPool(config) {

  const pool_of_pools = PoolOfPools(config)

  return {
    acquire: acquire.bind(null, pool_of_pools)
  , drain: drain.bind(null, pool_of_pools)
  }

}


module.exports = { createPool }
