var dirtybit = require('../lib/index')({a: '01', b: [2, 3]})
  , test = require('tape')

test('brackets', function(t) {
  t.plan(2)

  dirtybit.register('b[a[1]]', function(val) {
    t.strictEqual(val, 3)
  })


  dirtybit.register('+(b[a[1]] + "456")[2]', function(val) {
    t.strictEqual(val, 5)
  })
})
