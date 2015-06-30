var accessor = require('../')({b: {a: 1}, d: {}, e: Object})
var test = require('tape')

test('ternary operator', function (t) {
  t.plan(3)

  accessor.on('0 ? 1 : 2', function (val) {
    t.strictEqual(val, 2)
  })

  accessor.on('5 ? 1 : 2', function (val) {
    t.strictEqual(val, 1)
  })

  accessor.on('0 ? 1 ? 2 : 3 : 4 ? 5 : 6', function (val) {
    t.strictEqual(val, 5)
  })
})

test('binary operators', function (t) {
  t.plan(31)

  accessor.on('0 || 1', function (val) {
    t.strictEqual(val, 1)
  })
  accessor.on('3 || 0', function (val) {
    t.strictEqual(val, 3)
  })
  accessor.on('3 || 1', function (val) {
    t.strictEqual(val, 3)
  })
  accessor.on('0 && 1', function (val) {
    t.strictEqual(val, 0)
  })
  accessor.on('3 && 0', function (val) {
    t.strictEqual(val, 0)
  })
  accessor.on('3 && 1', function (val) {
    t.strictEqual(val, 1)
  })
  accessor.on('2 | 1', function (val) {
    t.strictEqual(val, 3)
  })
  accessor.on('1 & 3', function (val) {
    t.strictEqual(val, 1)
  })
  accessor.on('1 ^ 3', function (val) {
    t.strictEqual(val, 2)
  })
  accessor.on('"1" == 1', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('"2" == 1', function (val) {
    t.strictEqual(val, false)
  })
  accessor.on('"1" === 1', function (val) {
    t.strictEqual(val, false)
  })
  accessor.on('1 === 1', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('1 < 2', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('1 < 1', function (val) {
    t.strictEqual(val, false)
  })
  accessor.on('"a" in b', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('d instanceof e', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('1 <= 2', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('1 <= 1', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('1 <= 0', function (val) {
    t.strictEqual(val, false)
  })
  accessor.on('2 > 1', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('1 > 1', function (val) {
    t.strictEqual(val, false)
  })
  accessor.on('2 >= 1', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('1 >= 1', function (val) {
    t.strictEqual(val, true)
  })
  accessor.on('0 >= 1', function (val) {
    t.strictEqual(val, false)
  })
  accessor.on('1 + 1', function (val) {
    t.strictEqual(val, 2)
  })
  accessor.on('1 - 1', function (val) {
    t.strictEqual(val, 0)
  })
  accessor.on('"1" + 1', function (val) {
    t.strictEqual(val, '11')
  })
  accessor.on('1 * 3', function (val) {
    t.strictEqual(val, 3)
  })
  accessor.on('3 / 3', function (val) {
    t.strictEqual(val, 1)
  })
  accessor.on('5 % 3', function (val) {
    t.strictEqual(val, 2)
  })
})

test('unary operators', function (t) {
  t.plan(4)

  accessor.on('!1', function (val) {
    t.strictEqual(val, false)
  })
  accessor.on('~0', function (val) {
    t.strictEqual(val, -1)
  })
  accessor.on('+"1"', function (val) {
    t.strictEqual(val, 1)
  })
  accessor.on('-1', function (val) {
    t.strictEqual(val, -1)
  })
})
