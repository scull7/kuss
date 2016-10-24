/*eslint-env node, mocha*/

const demand  = require('must')
const Message = require('../../../lib/rabbitmq/message.js')


describe('lib/rabbitmq/message.js', function() {


  describe('::encode', function() {


    it('should throw an error if the content type is not provided',
    function() {

      const message = {
        content: Buffer.from('foo')
      }
      const test = () => Message.encodeContent(message)

      demand(test).throw(Error, 'Invalid Content-Type: undefined')

    })


    it('should allow a content buffer through unchanged', function() {

      const expected = 'this is a test'
      const test = {
        contentType: 'application/octet-stream'
      , content: Buffer.from(expected)
      }
      const actual = Message.encodeContent(test).toString()

      demand(actual).eql(expected)

    })


    it('should properly encode a json object', function() {

      const expected = { foo: 'bar' }
      const message  = {
        contentType: 'application/json'
      , content: expected
      }
      const actual = JSON.parse(
        Message.encodeContent(message).toString()
      )

      demand(actual).to.eql(expected)

    })


    it('should properly encode a plain text object', function() {

      const expected = 'this is a test'
      const message  = {
        contentType: 'text/plain'
      , content: expected
      }
      const actual = Message.encodeContent(message).toString()

      demand(actual).eql(expected)

    })


  })


  describe('::getOptions', function() {


    it('should not include content in the options', function() {

      const expected = { contentType: 'text/plain' }
      const message  = {
        contentType: 'text/plain'
      , content: 'this is a test'
      }
      const actual   = Message.getOptions(message)

      demand(actual).eql(expected)

    })


  })


})

