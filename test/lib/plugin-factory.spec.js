/*eslint-env node, mocha*/
const R      = require('ramda')
const demand = require('must')
const PF     = require('../../lib/plugin-factory.js')


describe('lib/plugin-factory.js', function() {


  describe('::Translate', function() {


    it('should translate the given configuration and pass it to the Plugin ' +
    'factory', function() {

      const translator = R.prop('foo')
      const plugin     = (cfg) => demand(cfg).eql('bar')
      const config     = { foo: 'bar' }

      PF(plugin).Translate(translator, config)

    })


  })

})
