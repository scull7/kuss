/*eslint-env node, mocha*/
/*eslint max-nested-callbacks: ["error", 4]*/

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


describe.only('lib/couchdb', function() {

  let connection = null
  let couchdb    = null

  before(function() {

    return Bluebird.resolve(GotCouch(DB_CONN))

    .tap((conn) => { connection = conn })

    .tap((conn) => conn.db.create(DB_NAME))

  })


  before(function() {

    return Bluebird.resolve(CouchDB({ db_config: DB_CONN }))

    .tap((client) => { couchdb = client })
  })


  after(function() {

    return connection.db.delete(DB_NAME)

  })

  describe('::insert', function() {

    it('should insert a document into the given bucket and return a unique ' +
    'identifier for that new document', function() {

      const test_doc = {
        username: 'superman'
      , name_first: 'Clark'
      , name_last: 'Kent'
      }

      return couchdb.insert(DB_NAME, test_doc)

      .then((id) => demand(id).is.a.string())

    })

  })


  describe('::upsert', function() {

  })

})
