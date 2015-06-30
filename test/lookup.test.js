var DirtyBit = require('../')
var test = require('tape')

test('lookup', function (t) {
  var val = {}

  val.a = {}
  val.a.b = '100'
  val.a.c = 95

  var instance = new DirtyBit(val)

  t.plan(4)

  instance.on('a.b - a.c', function (val) {
    t.equal(val, 5)
  })

  instance.on('a.b.length', function (val) {
    t.equal(val, 3)
  })

  instance.on('((a.c - a.b) + "").length', function (val) {
    t.equal(val, 2)
  })

  instance.on('this.a.b', function (val) {
    t.equal(val, '100')
  })
})
