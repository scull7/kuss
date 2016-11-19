/*eslint-env node, mocha*/
/*eslint max-nested-callbacks: ["error", 4]*/
/*eslint-disable  no-magic-numbers*/

const demand = require('must')
const Error  = require('../../lib/error.js')


describe('lib/error.js', function() {


  it('You should be able to throw a NotFound error',
  function() {

    try {

      Error.throwCussError(Error.NotFound, 'foo', 'bar')

    } catch (e) {

      demand(e.message).eql(`Not Found - TABLE: foo ID: bar`)
      demand(e.status).eql(404)

    }

  })


})
