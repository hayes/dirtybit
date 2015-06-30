var dirtybit = require('../')
var test = require('tape')

test('list', function (t) {
  t.plan(1)

  var instance = dirtybit({a: 5, b: 10, c: 15})

  instance.on('[a, b, c]', function (list) {
    t.deepEqual(list, [5, 10, 15])
  })
})
