/*eslint-env node, mocha*/
/* eslint no-magic-numbers: 0 */
/* eslint max-nested-callbacks: [ 'error', 5 ] */

const { expect }  = require('chai');
const MemoryStore = require('../../lib/memory');

describe('lib/memory-store.js', function() {

  let store = null;

  beforeEach(function() {
    store = MemoryStore();
  });


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

      const bucket = 'test';
      const data   = { foo: 'bar', boo: 'fuck' };
      const keys   = [ 'boo' ];

      return store.upsert(bucket, keys, data)

        .then((x) => {

          expect(x).to.be.a('string');

          return store.getById(bucket, x);

        })

        .then((x) => {

          expect(x.foo).to.eql('bar');
          expect(x.boo).to.eql('fuck');

        });

    });


    it ('should update an existing value', function() {

      const bucket = 'test';
      const data   = { foo: 'random thing', bar_key: 'blah' };
      const update = { foo: 'another thing', bar_key: 'blah' };
      const keys   = [ 'bar_key' ];

      return store.insert(bucket, data)

      .then(() => store.upsert(bucket, keys, update))

      .then(store.getById(bucket))

      .then((x) => {

        expect(x.foo).to.eql('another thing');
        expect(x.bar_key).to.eql('blah');

      });

    });

    it ('should throw an error when invalid bucket', function() {

      const bucket = 'test';
      const other_bucket = 'nottest';
      const data   = { foo: 'random thing', bar_key: 'blah' };
      const update = { foo: 'another thing', bar_key: 'blah' };
      const keys   = [ 'bar_key' ];

      return store.insert(bucket, data)

        .then(() => store.upsert(bucket, keys, update))

        // test with invalid bucket
        .then(store.getById(other_bucket))

        .then((x) => {

          expect(x.foo).to.eql('another thing');
          expect(x.bar_key).to.eql('blah');

        })

        .catch((err) => {

          // should throw an error for missing bucket
          (err.name).must.eql('Error');
          (err.message).must.eql(`Invalid Bucket: ${other_bucket}`);

        });

    });

  });

  describe('::projectAll', function() {

    it('should return proper projected keys', function() {

      const bucket = 'test';
      const data1  = { foo: 'random thing', bar_key: 'blah' };
      const data2  = { foo: 'another thing', bar_key: 'derp' };
      const data3  = { foo: 'yet another thing', bar_key: 'foo' };
      const keys   = [ 'bar_key' ];

      return store.insert(bucket, data1)
        .then(() => store.insert(bucket, data2))
        .then(() => store.insert(bucket, data3))

        .then(() => store.projectAll(bucket, keys))

        .then((x) => {

          x.must.have.length(3);
          x[0].must.include('blah');
          x[1].must.include('derp');
          x[2].must.include('foo');

        });

    });

  });

  describe('::findOneBy', function() {

    it('should get one item by prop and value', function() {

      const bucket = 'test';
      const data1 = { foo: 'random', bar_key: 'blah' };
      const data2 = { foo: 'randomer', bar_key: 'derp' };
      const proj = [ 'bar_key' ];

      return store.insert(bucket, data1)
        .then(() => store.insert(bucket, data2))
        
        .then(() => store.findOneBy(bucket, proj, 'bar_key', 'blah'))

        .then((x) => {

          x.must.be.an.object();
          x.must.include('blah');

        });

    });

    it('should return an error if it returns more than one obj', function() {

      const bucket = 'test';
      const data1 = { foo: 'random', bar_key: 'blah' };
      const data2 = { foo: 'randomer', bar_key: 'derp' };
      const data3 = { foo: 'randomest', bar_key: 'derp' };
      const proj = [ 'bar_key' ];

      return store.insert(bucket, data1)
        .then(() => store.insert(bucket, data2))
        .then(() => store.insert(bucket, data3))
        
        .then(() => store.findOneBy(bucket, proj, 'bar_key', 'derp'))

        .then((x) => {
            
          console.log(x);

        })
        .catch((e) => {

          (e.name).must.eql('TooManyRecords');

        }); 

    });

  });

  
  describe('::findById', function() {

    it('should get one item by id and project', function() {

      const bucket = 'test';
      const data = { foo: 'random', bar_key: 'blah' };
      const proj = [ 'bar_key' ];

      return store.insert(bucket, data)
        
        .then(store.findById(bucket, proj))

        .then((x) => {

          x.must.be.an.object();
          x.must.include('blah');

        });

    });

  });

});
