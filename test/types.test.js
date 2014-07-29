var accessor = require('../index')()
  , test = require('tape')

test('types', function(t) {
  t.plan(8)

  accessor.register('5', function(val) {
    t.strictEqual(val, 5)
  })

  accessor.register('5.5 + 5', function(val) {
    t.strictEqual(val, 10.5)
  })

  accessor.register('"5" + 10', function(val) {
    t.strictEqual(val, '510')
  })

  accessor.register("'5.5 + 5'", function(val) {
    t.strictEqual(val, '5.5 + 5')
  })

  accessor.register('true', function(val) {
    t.strictEqual(val, true)
  })

  accessor.register('false', function(val) {
    t.strictEqual(val, false)
  })

  accessor.register('null', function(val) {
    t.strictEqual(val, null)
  })

  accessor.register('undefined', function(val) {
    t.strictEqual(val, undefined)
  })
})
