var dirtybit = require('../lib/index')
  , test = require('tape')

test('list', function(t) {
  t.plan(1)

  var instance = dirtybit({a: 5, b: 10, c: 15})

  instance.register('a, b, c', function() {
    t.deepEqual(Array.prototype.slice.call(arguments), [5, 10, 15])
  })
})

test('deregister list', function(t) {
  t.plan(1)

  var instance = dirtybit({a: 5, b: 10, c: 15})

  instance.register('a, b, c', callback)
  instance.deregister('a, b, c', callback)

  t.deepEqual(instance._events, {})

  function callback() {}
})
