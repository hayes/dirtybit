var DirtyBit = require('../lib/index')
  , test = require('tape')

test('lookup and deregister', function(t) {
  var val = {}

  val.a = {}
  val.a.b = '100'
  val.a.c = 95

  var instance = DirtyBit(val)

  t.plan(7)

  instance.register('a.b - a.c', function(val) {
    t.equal(val, 5)
  })

  instance.register('a.b.length', function(val) {
    t.equal(val, 3)
  })

  instance.register('((a.c - a.b) + "").length', function(val) {
    t.equal(val, 2)
  })

  instance.register('this.a.b', function(val) {
    t.equal(val, '100')
  })

  instance.register('a.e + a.f', dereg)
  instance.deregister('a.e + a.f', dereg)

  t.notOk(instance.events._events['a.e'])
  t.notOk(instance.events._events['a.f'])
  t.notOk(instance._events['a.e + a.f'])

  function dereg() {}
})
