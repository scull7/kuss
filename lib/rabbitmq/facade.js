
const R        = require('ramda')
const Bluebird = require('bluebird')
const Message  = require('./message.js')


const run = (conn, message, method) =>

  conn.createConfirmChannel()

  .then((channel) => new Bluebird( function(resolve, reject) {

    const content = Message.encodeContent(message)
    const options = Message.getOptions(message)
    const done    = (err, ok) => err ? reject(err) : resolve(ok)

    method(channel, content, options, done)

  }))


const publish = R.curry((conn, exchange, routing_key, message) =>
  run(conn, message, (channel, content, options, cb) =>
    channel.publish(exchange, routing_key, content, options, cb)
  )
)


const sendToQueue = R.curry((conn, queue, message) =>
  run(conn, message, (channel, content, options, cb) =>
    channel.sendToQueue(queue, content, options, cb)
  )
)


module.exports = {
  publish
, sendToQueue
}
