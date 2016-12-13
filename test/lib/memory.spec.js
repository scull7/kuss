/*eslint-env node, mocha*/
/* eslint no-magic-numbers: 0 */
/* eslint max-nested-callbacks: [ 'error', 5 ] */

const R           = require('ramda')
const { expect }  = require('chai')
const MemoryStore = require('../../lib/memory')
const Err         = require('../../lib/error')


describe('lib/memory-store.js', function() {

  let store = null

  beforeEach(function() {
    store = MemoryStore()
  })

  describe('::deleteById', function() {

    it(`should delete a record with given identifier`, function() {

      const bucket    = 'test'
      const data1     = { id : '1', foo: 'bar', boo: 'fuck' }
      const state     = { [bucket] : { [data1.id] : data1 } }
      const tempStore = MemoryStore(state)

      return tempStore.deleteById(bucket, data1.id)

      .then(() => tempStore.getById(bucket, data1.id))

      .then((result) => {
        expect(result).to.be.undefined
      })
    })

    it(`should throw NotFound error if you try to delete a non-existant
      record`, function() {

      const bucket    = 'test'
      const data1     = { id : '1', foo: 'bar', boo: 'fuck' }
      const state     = { [bucket] : { [data1.id] : data1 } }
      const tempStore = MemoryStore(state)

      tempStore.deleteById(bucket, '2')
      .catch((err) => {
        expect(err.name).to.be.eq('NotFound')
        expect(err.status).to.be.eq(404)
      })

    })

  })


  describe('::update', function() {

    it('should update a value by id', function() {

      const bucket    = 'test'
      const data      = { id : '1', foo: 'bar', boo: 'fuck' }
      const state     = { [bucket] : { [data.id] : data } }
      const tempStore = MemoryStore(state)

      return tempStore.update(bucket, data.id, { boo : 'hoo' })

      .tap((id) => {
        expect(id).to.eql(data.id)
      })

      .then(tempStore.getById(bucket))

      .then((result) => {
        expect(result.foo).to.eql(data.foo)
        expect(result.boo).to.eql('hoo')
      })
    })

    it(`should throw a NotFound error if you try to update a non-existant
      document`, () => {

      const bucket    = 'test'
      const data      = { id : '1', foo: 'bar', boo: 'fuck' }
      const state     = { [bucket] : {} }
      const tempStore = MemoryStore(state)

      return tempStore.update(bucket, data.id, { boo : 'hoo' })
      .then(() => { throw new Error('should not have gotten here, noob') })
      .catch(Err.NotFound, e => { expect(e.status).eql(404) })
    })
  })


  describe('::updateWhereEq', function() {

    it('should update records that satisfy the predicate', function() {

      const bucket    = 'test'
      const data1     = { id : '1', foo: 'bar1', boo: 'fuck1' }
      const data2     = { id : '2', foo: 'bar1', boo: 'fuck2' }
      const data3     = { id : '3', foo: 'bar3', boo: 'fuck3' }
      const state     = {
        [bucket] : {
          [data1.id] : data1
        , [data2.id] : data2
        , [data3.id] : data3
        }
      }
      const tempStore = MemoryStore(state)

      return tempStore.updateWhereEq(bucket)({ foo : 'bar1' })({ boo : 'hoo' })

      .then(updated => {

        expect(updated).to.eql(2)

        expect(state[bucket][data1.id].id).to.eql(data1.id)
        expect(state[bucket][data1.id].foo).to.eql(data1.foo)
        expect(state[bucket][data1.id].boo).to.eql('hoo')

        expect(state[bucket][data2.id].id).to.eql(data2.id)
        expect(state[bucket][data2.id].foo).to.eql(data2.foo)
        expect(state[bucket][data2.id].boo).to.eql('hoo')

        expect(state[bucket][data3.id]).to.eql(data3)
      })
    })
  })


  describe('::upsert', function() {


    it('should insert a new value', function() {

      const bucket = 'test'
      const data   = { foo: 'bar', boo: 'fuck' }
      const keys   = [ 'boo' ]

      return store.upsert(bucket, keys, data)

        .then((x) => {

          expect(x).to.be.a('string')

          return store.getById(bucket, x)

        })

        .then((x) => {

          expect(x.foo).to.eql('bar')
          expect(x.boo).to.eql('fuck')

        })

    })


    it ('should update an existing value', function() {

      const bucket = 'test'
      const data   = { foo: 'random thing', bar_key: 'blah' }
      const update = { foo: 'another thing', bar_key: 'blah' }
      const keys   = [ 'bar_key' ]

      return store.insert(bucket, data)

      .then(() => store.upsert(bucket, keys, update))

      .then(store.getById(bucket))

      .then((x) => {

        expect(x.foo).to.eql('another thing')
        expect(x.bar_key).to.eql('blah')

      })

    })

    it ('should throw an error when invalid bucket', function() {

      const bucket = 'test'
      const other_bucket = 'nottest'
      const data   = { foo: 'random thing', bar_key: 'blah' }
      const update = { foo: 'another thing', bar_key: 'blah' }
      const keys   = [ 'bar_key' ]

      return store.insert(bucket, data)

        .then(() => store.upsert(bucket, keys, update))

        // test with invalid bucket
        .then(store.getById(other_bucket))

        .then((x) => {

          expect(x.foo).to.eql('another thing')
          expect(x.bar_key).to.eql('blah')

        })

        .catch((err) => {

          // should throw an error for missing bucket
          (err.name).must.eql('Error');
          (err.message).must.eql(`Invalid Bucket: ${other_bucket}`)

        })

    })

  })

  describe('::projectAll', function() {

    it('should return proper projected keys', function() {

      const bucket = 'test'
      const data1  = { foo: 'random thing', bar_key: 'blah' }
      const data2  = { foo: 'another thing', bar_key: 'derp' }
      const data3  = { foo: 'yet another thing', bar_key: 'foo' }
      const keys   = [ 'bar_key' ]

      return store.insert(bucket, data1)
        .then(() => store.insert(bucket, data2))
        .then(() => store.insert(bucket, data3))

        .then(() => store.projectAll(bucket, keys))

        .then((x) => {

          x.must.have.length(3)
          x[0].must.include('blah')
          x[1].must.include('derp')
          x[2].must.include('foo')

        })

    })

  })

  describe('::findOneBy', function() {

    it('should get one item by prop and value', function() {

      const bucket = 'test'
      const data1 = { foo: 'random', bar_key: 'blah' }
      const data2 = { foo: 'randomer', bar_key: 'derp' }
      const proj = [ 'bar_key' ]

      return store.insert(bucket, data1)
      .then(() => store.insert(bucket, data2))
      .then(() => store.findOneBy(bucket, proj, 'bar_key', 'blah'))
      .then((x) => {
        x.must.be.an.object()
        x.must.include('blah')
      })

    })

    it('should throw TooManyRecords if it returns more than one obj', () => {

      const bucket = 'test'
      const data1 = { foo: 'random', bar_key: 'blah' }
      const data2 = { foo: 'randomer', bar_key: 'derp' }
      const data3 = { foo: 'randomest', bar_key: 'derp' }
      const proj = [ 'bar_key' ]

      return store.insert(bucket, data1)
      .then(() => store.insert(bucket, data2))
      .then(() => store.insert(bucket, data3))
      .then(() => store.findOneBy(bucket, proj, 'bar_key', 'derp'))
      .then(() => { throw new Error('should not get here noob!') })
      .catch(Err.TooManyRecords, e => { (e.status).must.eql(500) })

    })

  })


  describe('::findById', function() {

    it('should get one item by id and project', function() {

      const bucket = 'test'
      const data = { foo: 'random', bar_key: 'blah' }
      const proj = [ 'bar_key' ]

      return store.insert(bucket, data)

        .then(store.findById(bucket, proj))

        .then((x) => {

          x.must.be.an.object()
          x.must.include('blah')

        })

    })

  })


  describe('::findWhereEq', function() {

    const state = {
      test : {
        1  : { id : '1', foo : 'bar1' }
      , 2  : { id : '2', foo : 'bar1' }
      , 3  : { id : '3', foo : 'bar1' }
      , 4  : { id : '4', foo : 'bar1' }
      , 5  : { id : '5', foo : 'bar1' }
      , 6  : { id : '6', foo : 'bar1' }
      , 7  : { id : '7', foo : 'bar1' }
      , 8  : { id : '8', foo : 'bar1' }
      , 9  : { id : '9', foo : 'bar1' }
      , 10 : { id : '10', foo : 'bar10' }
      , 11 : { id : '11', foo : 'bar11' }
      , 12 : { id : '12', foo : 'bar12' }
      , 13 : { id : '13', foo : 'bar13' }
      , 14 : { id : '14', foo : 'bar14' }
      , 15 : { id : '15', foo : 'bar15' }
      }
    }

    const tempStore = MemoryStore(state)


    it('should get all objects matching the predicate', function() {

      const request = {
        projection : ['id', 'foo']
      , predicates : {
          foo : 'bar1'
        }
      , sort : [{ foo : 'desc' }]
      }

      return tempStore.findWhereEq('test', request)

      .then(rows => { rows.must.have.length(9) })

    })


    it('should skip and limit the results', function() {

      const request = {
        projection : ['id', 'foo']
      , limit : 3
      , skip : 5
      }

      const expected = [
        { id : '6', foo : 'bar1' }
      , { id : '7', foo : 'bar1' }
      , { id : '8', foo : 'bar1' }
      ]

      return tempStore.findWhereEq('test', request)

      .then(rows => {
        (R.equals(expected, rows)).must.be.true()
        rows.must.have.length(3)
      })

    })


    it('should sort the results', function() {

      const request = {
        projection : ['id', 'foo']
      , sort       : [{ foo : 'desc' }]
      , skip       : 0
      , limit      : 3
      }

      const expected = [
        { id : '15', foo : 'bar15' }
      , { id : '14', foo : 'bar14' }
      , { id : '13', foo : 'bar13' }
      ]

      return tempStore.findWhereEq('test', request)

      .then(rows => {
        (R.equals(expected, rows)).must.be.true()
        rows.must.have.length(3)
      })

    })

    it('should sort the results with multiple sort keys', function() {

      const request = {
        projection : ['id', 'foo']
      , sort       : [{ foo : 'desc' }, { id : 'asc'} ]
      }

      const expected = [
        { id : '15', foo : 'bar15' }
      , { id : '14', foo : 'bar14' }
      , { id : '13', foo : 'bar13' }
      , { id : '12', foo : 'bar12' }
      , { id : '11', foo : 'bar11' }
      , { id : '10', foo : 'bar10' }
      , { id : '1', foo : 'bar1' }
      , { id : '2', foo : 'bar1' }
      , { id : '3', foo : 'bar1' }
      , { id : '4', foo : 'bar1' }
      , { id : '5', foo : 'bar1' }
      , { id : '6', foo : 'bar1' }
      , { id : '7', foo : 'bar1' }
      , { id : '8', foo : 'bar1' }
      , { id : '9', foo : 'bar1' }
      ]

      return tempStore.findWhereEq('test', request)

      .then(rows => {
        (R.equals(expected, rows)).must.be.true()
        rows.must.have.length(15)
      })

    })

  })

})
