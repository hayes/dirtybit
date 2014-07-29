var DirtyBit = require('../lib/index')
  , test = require('tape')

test('filters', function(t) {
  var val = {}

  val.a = {}
  val.a.b = '100'
  val.a.c = 95

  var instance = DirtyBit(val)

  t.plan(6)

  instance.register('a.b - a.c', function(val) {
    t.strictEqual(val, 5)
  })

  instance.register('a.b.length', function(val) {
    t.strictEqual(val, 3)
  })

  instance.register('((a.c - a.b) + "").length', function(val) {
    t.strictEqual(val, 2)
  })

  instance.register('a.e + a.f', dereg)
  instance.deregister('a.e + a.f', dereg)

  t.notOk(instance.events._events['a.e'])
  t.notOk(instance.events._events['a.f'])
  t.notOk(instance._events['a.e + a.f'])

  function dereg() {}
})
