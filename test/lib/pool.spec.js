/*eslint-env node, mocha*/

const R        = require('ramda')
const Bluebird = require('bluebird')
const demand   = require('must')
const Pool     = require('../../lib/pool.js')


describe('lib/pool.js', function() {


  describe('::create', function() {


    it('should add a backoff on resource create failure', function() {

      const ZERO    = 0
      const ONE     = 1
      const TWO     = 2

      let counter    = 0
      let start      = null
      const MAX_RUNS = 3

      const FIRST_WAIT  = 10
      const SECOND_WAIT = 10
      const THIRD_WAIT  = 20

      const config  = {
        max: ONE
      , min: ZERO
      , idleTimeoutMillis: 1
      , logger: {
          error: () => null
        }
      }

      const getWait = R.cond([
        [ R.equals(ONE), R.always(FIRST_WAIT) ]
      , [ R.equals(TWO), R.always(SECOND_WAIT) ]
      , [ R.T,           R.always(THIRD_WAIT) ]
      ])

      const builder = () => ({

        create: () => new Bluebird((resolve, reject) => {
          const now = new Date().getTime()

          if (counter > ZERO) {
            demand(now - start).be.at.least(getWait(counter))
          }

          if (counter <= MAX_RUNS) {
            counter = R.inc(counter)
            start   = now

            return reject(new Error('I failed on purpose'))
          }

          return resolve('OK')
        })

      , destroy: R.always(true)

      })


      const pool = Pool.create(builder)(config)

      return pool.acquire()

      .then( r => pool.release(r))

      .then(() => pool.shutdown())

    })


  })


})
