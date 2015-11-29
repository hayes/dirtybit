var dirtybit = require('../')({a: '01', b: [2, 3]})
var test = require('tape')

test('brackets', function (t) {
  t.plan(2)

  dirtybit.on('b[a[1]]', function (val) {
    t.strictEqual(val, 3)
  })

  dirtybit.on('+(b[a[1]] + "456")[2]', function (val) {
    t.strictEqual(val, 5)
  })
})
