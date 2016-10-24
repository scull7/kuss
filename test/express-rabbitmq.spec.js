/*eslint-env node, mocha*/
const demand       = require('must')
const EventEmitter = require('events')
const Plugin       = require('../express-rabbitmq.js')
const Message      = require('../lib/rabbitmq/message.js')
const RabbitMQPool = require('../lib/rabbitmq/pool.js')


/*eslint-disable max-nested-callbacks*/
describe('express-rabbitmq.js', function() {

  const pool = RabbitMQPool()
  let conn   = null


  before((done) => {

    pool.acquire((err, rabbitmq) => {

      if (err) return done(err)

      conn = rabbitmq

      return done()

    })

  })


  after(() => pool.destroyAllNow())


  describe('::publish', function() {

    const EXCHANGE = 'test-express-publish-exchange'
    const TYPE     = 'fanout'
    const QUEUE    = 'test-express-publish-queue'

    let channel    = null

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

      const expected = 'this is an express publish test'

      channel.consume(QUEUE, (msg) => {

        if (null === msg) return null

        demand(Message.decodeContent(msg)).eql(expected)

        channel.ack(msg)

        done()

      })

      const req = {}
      const res = new EventEmitter()

      Plugin({})(req, res, (err) => {

        if (err) return done(err)

        req.rabbitmq.publish(EXCHANGE, '*', {
          contentType: Message.CONTENT_TYPE.TEXT
        , content: expected
        })

      })

    })


  })


  describe('::sendToQueue', function() {

    const QUEUE = 'test-express-send-to-queue'
    let channel = null

    beforeEach(() =>

      conn.createChannel()

      .tap((ch) => { channel = ch })

      .tap((ch) => ch.assertQueue(QUEUE, {}))
    )


    afterEach(() => channel.deleteQueue(QUEUE))


    it('should publish a message directly to the queue', function(done) {

      const expected = 'this is my express queue'

      channel.consume(QUEUE, (msg) => {

        if (null === msg) return null

        demand(Message.decodeContent(msg)).eql(expected)

        channel.ack(msg)

        done()

      })

      const req = {}
      const res = new EventEmitter()

      Plugin({})(req, res, (err) => {

        if (err) return done(err)

        req.rabbitmq.sendToQueue(QUEUE, {
          contentType: Message.CONTENT_TYPE.TEXT
        , content: expected
        })

      })


    })

  })


})
