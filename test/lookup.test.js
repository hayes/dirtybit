var DirtyBit = require('../lib/index')
  , test = require('tape')

test('lookup and deregister', function(t) {
  var val = {}

  val.a = {}
  val.a.b = '100'
  val.a.c = 95

  var instance = DirtyBit(val)

  t.plan(9)

  instance.on('a.b - a.c', function(val) {
    t.equal(val, 5)
  })

  instance.on('a.b.length', function(val) {
    t.equal(val, 3)
  })

  instance.on('((a.c - a.b) + "").length', function(val) {
    t.equal(val, 2)
  })

  instance.on('this.a.b', function(val) {
    t.equal(val, '100')
  })

  instance.on('a.e + a.f', dereg)
  instance.removeListener('a.e + a.f', dereg)

  t.notOk(instance.expressions['a.e'])
  t.notOk(instance.expressions['a.f'])
  t.notOk(instance.expressions['a.e + a.f'])
  t.notOk(instance.handlers['a.e + a.f'])
  t.equal(instance.handlerList.indexOf('a.e + a.f'), -1)

  function dereg() {}
})
