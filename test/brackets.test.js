var DirtyBit = require('../lib/index')({a: '01', b: [2, 3]})
  , test = require('tape')

test('brackets', function(t) {
  t.plan(2)

  DirtyBit.register('b[a[1]]', function(val) {
    t.strictEqual(val, 3)
  })

  DirtyBit.register('+(b[a[1]] + "456")[2]', function(val) {
    t.strictEqual(val, 5)
  })
})
