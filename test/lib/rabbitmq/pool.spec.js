/*eslint-env node, mocha*/

const demand       = require('must')
const Bluebird     = require('bluebird')
const RabbitMqPool = require('../../../lib/rabbitmq/pool.js')


//4096 is the default frame maximum
//http://www.squaremobius.net/amqp.node/channel_api.html#connect
const DEFAULT_FRAME_MAX = 4096


const acquire = (pool) => new Bluebird((resolve, reject) => {
  pool.acquire((err, conn) => err ? reject(err) : resolve(conn))
})


describe('RabbitMQ Pool', function() {

  let pool = null


  before(function() { pool = RabbitMqPool() })


  after(function() { pool.destroyAllNow() })


  it('should connect to localhost by default', function() {

    return acquire(pool)

    .then((conn) => {

      demand(conn.connection.frameMax).eql(DEFAULT_FRAME_MAX)

      return pool.release(conn)

    })

  })


})
