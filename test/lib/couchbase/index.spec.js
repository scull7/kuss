/*eslint-env node, mocha*/
/*eslint max-nested-callbacks: ["error", 5]*/
/*eslint-disable  no-magic-numbers*/
/*eslint-disable  no-throw-literal*/

const R         = require('ramda')
const Bluebird  = require('bluebird')
const demand    = require('must')
const Couchbase = require('../../../lib/couchbase/index.js')
const Connector = require('../../../lib/couchbase/wrapper.js')
const Manager   = require('../../../lib/couchbase/manager.js')


const DB_NAME   = 'kuss-test-db'
const DB_CONN   = {
  url      : 'http://localhost'
, username : 'Administrator'
, password : 'password'
}


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


describe.only('lib/couchbase', function () {

  let connection = null
  let couchbase  = null
  let manager    = null

  before(function() {

    return Bluebird.resolve(Manager(DB_CONN))

    .tap((mgr) => { manager = mgr })

  })


  after(function() {

    //return manager.removeBucket(DB_NAME)

  })


  beforeEach(function() {

    return Bluebird.resolve(manager.removeBucket(DB_NAME))

    .finally(() =>

      manager.createBucket(DB_NAME)

      .then(() => Connector(DB_CONN))

      .tap((conn) => { connection = conn })

      .then((conn) => Couchbase(conn))

      .tap((cb) => { couchbase = cb })

    )

    // don't care about the deletion error.
    // we will know about the failed created from the failed tests.
    .catch(() => null)

  })


  describe('::insert', function() {

    it('should insert a document into the given bucket and return a unique ' +
      'identifier for that new document', function() {

        return couchbase.insert(DB_NAME, TEST_DOCS[0])

        .tap((x) => console.log("INSERT RESPONSE: ", x))

        .then((id) => demand(id).is.a.string())

      })


  })

})
