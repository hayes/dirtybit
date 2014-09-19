var accessor = require('../lib/index')()
  , test = require('tape')

test('types', function(t) {
  t.plan(8)

  accessor.on('5', function(val) {
    t.strictEqual(val, 5)
  })

  accessor.on('5.5 + 5', function(val) {
    t.strictEqual(val, 10.5)
  })

  accessor.on('"5" + 10', function(val) {
    t.strictEqual(val, '510')
  })

  accessor.on("'5.5 + 5'", function(val) {
    t.strictEqual(val, '5.5 + 5')
  })

  accessor.on('true', function(val) {
    t.strictEqual(val, true)
  })

  accessor.on('false', function(val) {
    t.strictEqual(val, false)
  })

  accessor.on('null', function(val) {
    t.strictEqual(val, null)
  })

  accessor.on('undefined', function(val) {
    t.strictEqual(val, undefined)
  })
})
