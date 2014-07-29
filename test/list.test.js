var accessor = require('../index')({a: 5, b: 10, c: 15})
  , test = require('tape')

test('parts', function(t) {
  t.plan(1)

  accessor.registerList(['a', 'b', 'c'], function(args) {
    t.deepEqual(args, [5, 10, 15])
  })
})
