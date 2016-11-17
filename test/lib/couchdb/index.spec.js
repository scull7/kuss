/*eslint-env node, mocha*/
/*eslint max-nested-callbacks: ["error", 4]*/
/*eslint-disable  no-magic-numbers*/

const R        = require('ramda')
const Bluebird = require('bluebird')
const demand   = require('must')
const GotCouch = require('got-couch')
const CouchDB  = require('../../../lib/couchdb/index.js')

const DB_NAME  = 'kuss-test-db'
const DB_CONN  = {
  url: 'http://localhost'
, port: 5984
, username: 'root'
, password: 'password'
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
  , name_last: 'constantine'
  , side: 'hero'
  }
, { username: 'damien_darhk'
  , name_first: 'Damien'
  , name_last: 'Darhk'
  , side: 'villain'
  }
]


function insertAllTestDocs(couchdb) {
  return Bluebird.all(
    TEST_DOCS.map(doc => couchdb.insert(DB_NAME, doc))
  )
}


describe.only('lib/couchdb', function() {

  let connection = null
  let couchdb    = null

  before(function() {

    return Bluebird.resolve(GotCouch(DB_CONN))

    .tap((conn) => { connection = conn })

  })


  before(function() {

    return Bluebird.resolve(CouchDB({ db_config: DB_CONN }))

    .tap((client) => { couchdb = client })
  })


  after(function() {

    return connection.db.delete(DB_NAME)

  })


  beforeEach(function() {

    return Bluebird.resolve(connection.db.delete(DB_NAME))

    .finally(() => connection.db.create(DB_NAME))

    // don't care about the deletion error.
    // we will know about the failed created from the failed tests.
    .catch(() => null)

  })

  describe('::insert', function() {

    it('should insert a document into the given bucket and return a unique ' +
    'identifier for that new document', function() {

      return couchdb.insert(DB_NAME, TEST_DOCS[0])

      .then((id) => demand(id).is.a.string())

    })

  })


  describe('::findWhere', function() {

    it('should find documents with the matching keys', function() {

      return insertAllTestDocs(couchdb)

      .then(() => couchdb.findWhere(
        DB_NAME
      , [ 'username' ]
      , [ 'side' ]
      , [ 'villain' ]
      ))

      .then(response => response.docs)

      .map(doc => doc.username)

      .then((list) => {
        demand(list).contain('lex_luthor')
        demand(list).contain('damien_darhk')
      })

    })

  })


  describe('::upsert', function() {


    it('should both insert and update a document into the given bucket',
    function() {
      const test_doc = {
        username: 'batman'
      , name_first: 'Bruce'
      , name_last: 'Wayne'
      }

      return couchdb.upsert(DB_NAME, ['username'], test_doc)

      .tap((id) => demand(id).is.a.string())

      .then(() => couchdb.upsert(DB_NAME, ['username'], R.merge(test_doc, {
        nickname: 'The Black Knight'
      })))

      .then(couchdb.getById(DB_NAME))

      .then((batman) => {
        demand(batman.username).eql(test_doc.username)
        demand(batman.name_first).eql(test_doc.name_first)
        demand(batman.name_last).eql(test_doc.name_last)
        demand(batman.nickname).eql('The Black Knight')
      })

    })


  })

})
