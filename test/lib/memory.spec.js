/*eslint-env node, mocha*/
const { expect }  = require('chai');
const MemoryStore = require('../../lib/memory');

describe('lib/memory-store.js', function() {

  let store = null;

  beforeEach(function() {
    store = MemoryStore();
  });


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


  });

});
