/*eslint-env node, mocha*/
/*eslint max-nested-callbacks: ["error", 4]*/
/*eslint-disable  no-magic-numbers*/

const demand = require('must')
const Error  = require('../../lib/error.js')


describe('lib/error.js', function() {


  it('You should be able to throw a NotFound error',
  function() {

    try {

      Error.throwCussError(Error.NotFound, 'couch', 'foo', 'bar')

    } catch (e) {

      demand(e.name).eql('NotFound')
      demand(e.status).eql(404)
      demand(e.message).eql(`Not Found - STORE: couch TABLE: foo ID: bar`)

    }

  })

  it('NotFound Error should have a composable throw method',
  function() {

    try {

      Error.NotFound.throw('couch')('foo')('bar')

    } catch (e) {

      demand(e.name).eql('NotFound')
      demand(e.status).eql(404)
      demand(e.message).eql(`Not Found - STORE: couch TABLE: foo ID: bar`)

    }

  })

  it('TooManyRecords Error should have a composable throw method',
  function() {

    try {

      Error.TooManyRecords.throw('couch')('interest')('fave')('butts')(2)

    } catch (e) {

      const message = 'Too many records. '
                    + 'Found 2 records in \`couch\`.\`interest\` '
                    + 'where \`fave\` = "butts"'

      demand(e.name).eql('TooManyRecords')
      demand(e.status).eql(500)
      demand(e.message).eql(message)
    }

  })

})
