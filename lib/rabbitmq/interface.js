
const R        = require('ramda');
const Bluebird = require('bluebird');
const amqplib  = require('amqplib');


const PREFETCH = 1 // only deliver one message at a time

const QUEUE_CONFIG_PROPS = [
  'durable'
, 'deadLetterExchange'
, 'maxPriority'
]

const MSG_CONFIG_PROPS = [
  'persistent' // (boolean)
, 'expiration' // (string) number of milliseconds. string wtf?
, 'priority' // (positive integer)

// Optional application specific parameters
, 'correlationId' // (string) usually to match replies to requests.
, 'messageId' // (string) application specific identifier.
, 'timestamp' // (positive number) timestamp for the message.
, 'appId' // (string) arbitray ID of the originating application.
]


const HANDLER_CONFIG_PROPS = [
  'noAck' // (boolean) to acknowledge or not to acknowledge?
, 'prefetch' // (integer) how many messages we send to a worker at once
]


// setting undefineds just to notate their existance.
const DEFAULT_CONFIG = {
  name: undefined
, durable: true
, persistent: true
, deadLetterExchange: undefined
, maxPriority: undefined
, noAck: false
, prefetch: PREFETCH
};


const objToBuffer = R.compose(Buffer.from, JSON.stringify);


const bufferToObj = R.compose(
JSON.parse
, (buf) => buf.toString()
);


const parseConfig = (props) => R.compose(
  R.pick(props)
, R.merge(DEFAULT_CONFIG)
)


const parseQueueConfig   = parseConfig(QUEUE_CONFIG_PROPS);
const parseMsgConfig     = parseConfig(MSG_CONFIG_PROPS);
const parseHandlerConfig = parseConfig(HANDLER_CONFIG_PROPS);


const send = R.curry((channel, config, message) => {
  if (!R.is(Object, message)) {
    throw new Error('Message must be an object');
  }

  if (!R.is(String, config.name)) {
    throw new Error('Queue name must be a string');
  }

  const name         = config.name;
  const msg_buffer   = objToBuffer(message);
  const queue_config = parseQueueConfig(config);
  const msg_config   = parseMsgConfig(config);

  
  return channel.assertQueue(name, queue_config)

  .then(() => channel.sendToQueue(name, msg_buffer, msg_config))

  ;
});


const listen = R.curry((channel, config, user_handler) => {
  if (!R.is(Object, config)) {
    throw new Error('Configuration is required');
  }

  if (typeof user_handler !== 'function') {
    throw new Error('Handler must be a function');
  }


  const name           = config.name;
  const handler_config = parseHandlerConfig(config);
  const queue_config   = parseQueueConfig(config);
  const wrap           = (my_handler) => (msg) => {
    if (msg === null) return;

    const content  = bufferToObj(msg.content);
    const fn       = config.noAck ? my_handler :
      (content, props, msg) =>
        my_handler(content, props, msg).tap(() => channel.ack(msg))
    ;

    return fn(content, msg.properties, msg);

  };

  return channel.prefetch(handler_config.prefetch)

  .then(() => channel.assertQueue(name, queue_config))

  .then(() => channel.consume(name, wrap(user_handler), handler_config))

});


const del = R.curry((channel, name, config = {}) =>
  Bluebird.resolve(channel.deleteQueue(name, config))
);


const Connect = (config) => amqplib.connect(config.url);


const Channel = (config) =>
  Connect(config).then((connection) => connection.createChannel())


const Factory = (config) => Channel(config).then((channel) => ({
  send: send(channel)
, listen: listen(channel)
, delete: del(channel)
}));


module.exports = {
  Factory
, Connect
, Channel
};
