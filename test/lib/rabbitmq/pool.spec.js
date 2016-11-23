/*eslint-env node, mocha*/

const demand       = require('must')
const RabbitMqPool = require('../../../lib/rabbitmq/pool.js')


//4096 is the default frame maximum
//http://www.squaremobius.net/amqp.node/channel_api.html#connect
const DEFAULT_FRAME_MAX = 4096


describe('RabbitMQ Pool', function() {

  let pool = null


  before(function() { pool = RabbitMqPool() })


  after(() => pool.shutdown())


  it('should connect to localhost by default', function() {

    return pool.acquire()

    .then( conn => {

      demand(conn.connection.frameMax).eql(DEFAULT_FRAME_MAX)

      return pool.release(conn)

    })

  })


})
