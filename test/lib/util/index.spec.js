/*eslint-env node, mocha*/
/* eslint no-magic-numbers: 0 */

const R           = require('ramda')
const { expect }  = require('chai')
const Util        = require('../../../lib/util')


describe('lib/util/index.js', function() {

  describe('::sortWhere', function() {

    it('should, like, literally sort the list by the given functions', () => {

      const objs = [
        { id: 4, user : { name: 'frankie' } }
      , { id: 6, user : { name: 'kyle' } }
      , { id: 5, user : { name: 'tj' } }
      , { id: 1, user : { name: 'evgeny' } }
      , { id: 1, user : { name: 'matt' } }
      , { id: 1, user : { name: 'michal-the-slayer' } }
      ]

      const sorted = Util.sortWhere([
        Util.ascend(R.prop('id'))
      , Util.descend(R.path(['user', 'name']))
      ], objs)

      expect(sorted).to.have.lengthOf(6)
      expect(R.head(sorted)).to.deep.eql(objs[5])
      expect(R.last(sorted)).to.deep.eql(objs[1])

    })

  })


  describe('::renameProp', function() {

    const obj = { id: 1, foo: 'bar' }

    it('should rename a property of a given object', () => {

      const new_obj = Util.renameProp('id', '_id', obj)

      const expected = { '_id': 1, foo: 'bar' }

      expect(new_obj).to.eql(expected)

    })

    it('should bypass if key doesn\'t exist', () => {

      const new_obj = Util.renameProp('a', 'b', obj)

      expect(new_obj).to.eql(obj)

    })

  })

})
