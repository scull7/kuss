/*eslint-env node, mocha*/
/*eslint max-nested-callbacks: ["error", 5]*/
/*eslint-disable  no-magic-numbers*/
/*eslint-disable  no-throw-literal*/

const debug     = require('debug')('kuss:couchbase:test:index')
const R         = require('ramda')
const Bluebird  = require('bluebird')
const demand    = require('must')
const Couchbase = require('../../../lib/couchbase/index.js')
const Connector = require('../../../lib/couchbase/wrapper.js')
const Manager   = require('../../../lib/couchbase/manager.js')


const DB_NAME   = 'kuss-test-db'
const DB_CONN   = {
  url      : 'couchbase://localhost'
, username : 'Administrator'
, password : 'password'
, buckets: {
    'kuss-test-db': { password: 'foo-bar' }
  }
}

// Set this to 10 seconds because it takes a damn long time for
// couchbase to prepare our fancy new bucket.
const DELAY_BUCKET_READY = 10000
const FLAG_FLUSH_ENABLED = 1


// Need a timeout of 15 seconds now because... see above
const TEST_TIMEOUT = 30000


const TEST_DOCS = [
  { username: 'superman'
  , name_first: 'Clark'
  , name_last: 'Kent'
  , side: 'hero'
  }
, { username: 'atom'
  , name_first: 'Ray'
  , name_last: 'Palmer'
  , side: 'hero'
  }
, { username: 'green_lantern'
  , name_first: 'Hal'
  , name_last: 'Jordan'
  , side: 'hero'
  }
, { username: 'lex_luthor'
  , name_first: 'Lex'
  , name_last: 'Luthor'
  , side: 'villain'
  }
, { username: 'anarky'
  , name_first: 'Lonnie'
  , name_last: 'Machin'
  , side: 'both'
  }
, { username: 'constantine'
  , name_first: 'John'
  , name_last: 'Constantine'
  , side: 'hero'
  }
, { username: 'damien_darhk'
  , name_first: 'Damien'
  , name_last: 'Darhk'
  , side: 'villain'
  }
]


function insertAllTestDocs(couchbase) {
  return Bluebird.all(
    TEST_DOCS.map(doc => couchbase.insert(DB_NAME, doc))
  )
}


function createBucket(manager, bucket_name, password) {

  return manager.createBucket(bucket_name, {
    saslPassword: password
  , flushEnabled: FLAG_FLUSH_ENABLED
  })

  .delay(DELAY_BUCKET_READY)

}


function createIfNotExists(bucket_name, password) {

  const manager = Manager(DB_CONN)

  return manager.listBuckets()

  .tap(list => debug("CURRENT_BUCKETS: %o", R.map(R.prop('name'), list)))

  .filter(R.propEq('name', DB_NAME))

  .then(R.when(R.isEmpty, () => createBucket(manager, bucket_name, password)))

}


describe.only('lib/couchbase', function () {

  this.timeout(TEST_TIMEOUT)

  let couchbase  = null
  //let connection = null

  before(function Initialize() {

    return createIfNotExists(DB_NAME, DB_CONN.buckets[DB_NAME].password)

    .then(() => Connector(DB_CONN))

    //.tap(conn => { connection = conn })

    // This will take about 20s because... reasons.
    .tap(conn => conn.truncate(DB_NAME))

    .tap(() => debug("Couchbase connection initialized"))

    .then((conn) => Couchbase(conn))

    .tap((cb) => { couchbase = cb })

    .tap(() => debug("Couchbase client initialized"))

    .then(insertAllTestDocs)

    .catch(err => {
      debug('beforeEach - ERROR: %o', err)
      throw err
    })

  })


  describe('::insert', function() {

    it('should insert a document into the given bucket and return a unique ' +
      'identifier for that new document', function() {

        const the_flash =
          { username: 'the_flash'
          , name_first: 'Barry'
          , name_last: 'Allen'
          , side: 'hero'
          }

        return couchbase.insert(DB_NAME, the_flash)

        .tap(x => debug("insert response: %o", x))

        .then(res => {

          demand(res.id).be.a.string()
          demand(res.cas.toString()).be.a.string()

          return couchbase.getById(DB_NAME, res.id)
        })

        .delay(100)

        .tap(x => debug("getById response: %o", x))

        .then(doc => {
          demand(doc.username).must.equal('the_flash')
          demand(doc.name_first).must.equal('Barry')
          demand(doc.name_last).must.equal('Allen')
          demand(doc.side).must.equal('hero')

          doc.name_first = 'Larry'

          return couchbase.upsert(DB_NAME, ['username'], doc)
        })

        .then(res => {
          demand(res.id).is.a.string()
        })

      })


  })

})
