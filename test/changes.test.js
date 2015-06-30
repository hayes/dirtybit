var dirtybit = require('../')
var test = require('tape')

test('change', function (t) {
  t.plan(3)

  var instance = dirtybit({a: []})
  var count = 0

  instance.on('a', function (list) {
    t.equal(list.length, count++)
  })

  instance.state.a.push(count)
  instance.update(instance.state)

  instance.state.a.push(count)
  instance.update(instance.state)
})
