var dirtybit = require('../lib/index')
var test = require('tape')

test('list', function(t) {
  t.plan(1)

  var instance = dirtybit({a: 5, b: 10, c: 15})

  instance.on('[a, b, c]', function(list) {
    t.deepEqual(list, [5, 10, 15])
  })
})

test('deregister list', function(t) {
  t.plan(3)

  var instance = dirtybit()

  instance.on('[a, b, c]', callback)
  instance.removeListener('[a, b, c]', callback)

  var root = instance.expressions.map.this
  var map = {'this': root}
  var watched = []

  t.deepEqual(instance.watched, watched)
  t.deepEqual(instance.handlers, {})
  t.deepEqual(instance.expressions, {map: map, list: []})

  function callback() {}
})
