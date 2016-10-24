
const ExpressMySqlStore  = require('./express-mysql.js')
const ExpressMemoryStore = require('./express-memory.js')
const ExpressRabbitMQ    = require('./express-rabbitmq.js')
const MySqlStore         = require('./lib/mysql')
const MemoryStore        = require('./lib/memory')
const RabbitMQFacade     = require('./lib/rabbitmq/facade.js')
const RabbitMQPool       = require('./lib/rabbitmq/pool.js')


module.exports = {
  Express: {
    MySqlStore: ExpressMySqlStore
  , MemoryStore: ExpressMemoryStore
  , RabbitMQ: ExpressRabbitMQ
  }
, MySqlStore
, MemoryStore
, RabbitMQ: {
    Pool: RabbitMQPool
  , Facade: RabbitMQFacade
  }
}
