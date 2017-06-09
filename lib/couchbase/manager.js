
const Bluebird  = require('bluebird')
const couchbase = require('couchbase')


module.exports = (config) => {

  const cluster = new couchbase.Cluster(config.url)
  const manager = cluster.manager(config.username, config.password)


  const listBuckets = (mgr) => new Bluebird((resolve, reject) =>
    mgr.listBuckets((err, list) => err ? reject(err) : resolve(list))
  )


  const createBucket = (mgr, name, opts) => new Bluebird((resolve, reject) =>
    mgr.createBucket(name, opts, (err, res) => err ? reject(err) : resolve(res))
  )


  const removeBucket = (mgr, name) => new Bluebird((resolve, reject) =>
    mgr.removeBucket(name, (err, res) => err ? reject(err) : resolve(res))
  )


  return {
    listBuckets  : listBuckets.bind(null, manager)
  , createBucket : createBucket.bind(null, manager)
  , removeBucket : removeBucket.bind(null, manager)
  }
}

