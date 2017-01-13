
const R        = require('ramda')
const Bluebird = require('bluebird')
const Message  = require('./message.js')


const run = (conn, message, method) =>

  Bluebird.resolve(conn)

  .then(connection => connection.createConfirmChannel())

  .then((channel) => {

    const content = Message.encodeContent(message)
    const options = Message.getOptions(message)

    channel.waitForConfirms().then(() => channel.close())

    return method(channel, content, options)

  })


const publish = R.curry((conn, exchange, routing_key, message) =>
  run(conn, message, (channel, content, options) =>
    channel.publish(exchange, routing_key, content, options)
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
