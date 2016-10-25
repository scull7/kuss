/*eslint-env node, mocha*/
const demand         = require('must')
const Message        = require('../../../lib/rabbitmq/message.js')
const RabbitMQPool   = require('../../../lib/rabbitmq/pool.js')
const RabbitMQFacade = require('../../../lib/rabbitmq/facade.js')


/*eslint-disable max-nested-callbacks*/
describe('lib/rabbitmq/facade.js', function() {

  const pool = RabbitMQPool()
  let conn   = null

  before(function(done) {

    pool.acquire((err, rabbitmq) => {

      if (err) return done(err)


      conn = rabbitmq

      return done()

    })

  })


  after(function() {
    pool.destroyAllNow()
  })


  describe('::publish', function() {

    const EXCHANGE = 'test-facade-publish-exchange'
    const TYPE     = 'fanout'
    const QUEUE    = 'test-facade-publish-queue'

    let channel = null


    beforeEach(() =>
      conn.createChannel()

      .tap((ch) => { channel = ch })

      .tap((ch) => ch.assertExchange(EXCHANGE, TYPE, {}))

      .tap((ch) => ch.assertQueue(QUEUE, {}))

      .tap((ch) => ch.bindQueue(QUEUE, EXCHANGE, '*'))

    )


    afterEach(() =>
      channel.deleteQueue(QUEUE)

      .tap(() => channel.deleteExchange(EXCHANGE))
    )


    it('should publish a message to the exchange', function(done) {

      const expected = 'this is only a test'

      channel.consume(QUEUE, (msg) => {

        if (null === msg) return null

        demand(Message.decodeContent(msg)).eql(expected)

        channel.ack(msg)

        done()

      })

      RabbitMQFacade.publish(conn, EXCHANGE, 'foo', {
        contentType: Message.CONTENT_TYPE.TEXT
      , content: expected
      })

    })


  })


  describe('::sendToQueue', function() {

    const QUEUE = 'test-send-to-queue'

    let channel = null

    beforeEach(() =>

      conn.createChannel()

      .tap((ch) => { channel = ch })

      .tap((ch) => ch.assertQueue(QUEUE, {}))

    )


    afterEach(() => channel.deleteQueue(QUEUE))


    it('should publish a message directly to a queue', function(done) {

      const expected = 'this is my queue'

      channel.consume(QUEUE, (msg) => {

        if (null === msg) return null

        demand(Message.decodeContent(msg)).eql(expected)

        channel.ack(msg)

        done()

      })

      RabbitMQFacade.sendToQueue(conn, QUEUE, {
        contentType: Message.CONTENT_TYPE.TEXT
      , content: expected
      })

    })

  })


})
