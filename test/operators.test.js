var accessor = require('../lib/index')({b: {a: 1}, d: new Object, e: Object})
  , test = require('tape')

test('ternary operator', function(t) {
  t.plan(3)

  accessor.register('0 ? 1 : 2', function(val) {
    t.strictEqual(val, 2)
  })

  accessor.register('5 ? 1 : 2', function(val) {
    t.strictEqual(val, 1)
  })

  accessor.register('0 ? 1 ? 2 : 3 : 4 ? 5 : 6', function(val) {
    t.strictEqual(val, 5)
  })
})

test('binary operators', function(t) {
  t.plan(31)

  accessor.register('0 || 1', function(val) {
    t.strictEqual(val, 1)
  })
  accessor.register('3 || 0', function(val) {
    t.strictEqual(val, 3)
  })
  accessor.register('3 || 1', function(val) {
    t.strictEqual(val, 3)
  })
  accessor.register('0 && 1', function(val) {
    t.strictEqual(val, 0)
  })
  accessor.register('3 && 0', function(val) {
    t.strictEqual(val, 0)
  })
  accessor.register('3 && 1', function(val) {
    t.strictEqual(val, 1)
  })
  accessor.register('2 | 1', function(val) {
    t.strictEqual(val, 3)
  })
  accessor.register('1 & 3', function(val) {
    t.strictEqual(val, 1)
  })
  accessor.register('1 ^ 3', function(val) {
    t.strictEqual(val, 2)
  })
  accessor.register('"1" == 1', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('"2" == 1', function(val) {
    t.strictEqual(val, false)
  })
  accessor.register('"1" === 1', function(val) {
    t.strictEqual(val, false)
  })
  accessor.register('1 === 1', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('1 < 2', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('1 < 1', function(val) {
    t.strictEqual(val, false)
  })
  accessor.register('"a" in b', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('d instanceof e', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('1 <= 2', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('1 <= 1', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('1 <= 0', function(val) {
    t.strictEqual(val, false)
  })
  accessor.register('2 > 1', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('1 > 1', function(val) {
    t.strictEqual(val, false)
  })
  accessor.register('2 >= 1', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('1 >= 1', function(val) {
    t.strictEqual(val, true)
  })
  accessor.register('0 >= 1', function(val) {
    t.strictEqual(val, false)
  })
  accessor.register('1 + 1', function(val) {
    t.strictEqual(val, 2)
  })
  accessor.register('1 - 1', function(val) {
    t.strictEqual(val, 0)
  })
  accessor.register('"1" + 1', function(val) {
    t.strictEqual(val, '11')
  })
  accessor.register('1 * 3', function(val) {
    t.strictEqual(val, 3)
  })
  accessor.register('3 / 3', function(val) {
    t.strictEqual(val, 1)
  })
  accessor.register('5 % 3', function(val) {
    t.strictEqual(val, 2)
  })
})

test('unary operators', function(t) {
  t.plan(4)

  accessor.register('!1', function(val) {
    t.strictEqual(val, false)
  })
  accessor.register('~0', function(val) {
    t.strictEqual(val, -1)
  })
  accessor.register('+"1"', function(val) {
    t.strictEqual(val, 1)
  })
  accessor.register('-1', function(val) {
    t.strictEqual(val, -1)
  })
})
