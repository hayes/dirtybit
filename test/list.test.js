var dirtybit = require('../lib/index')
  , test = require('tape')

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

  t.deepEqual(instance.handlers, {})
  t.deepEqual(instance.handlerList, [])

  var expressions = {}

  expressions['this'] = instance.expressions['this']
  t.deepEqual(instance.expressions, expressions)

  function callback() {}
})
