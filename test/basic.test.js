var dirtybit = require('../')
var test = require('tape')

test('multiple handlers', function (t) {
  var instance = dirtybit({a: 1})
  t.plan(4)

  var updated = false

  instance.on('a', function (val) {
    if (!updated) return t.equal(val, 1)
    t.equal(val, 2)
  })

  instance.on('a', function (val) {
    if (!updated) return t.equal(val, 1)
    t.equal(val, 2)
    t.end()
  })

  updated = true
  instance.update({a: 2})
})

test('remove handler', function (t) {
  t.plan(4)

  var instance = dirtybit({a: 1})
  var removed = false

  instance.addHelper('double', function (change) {
    return function double (x) {
      change(x * 2)
    }
  })

  instance.on('double(a)', onDouble1)
  instance.on('double(a)', onDouble2)

  removed = true

  instance.removeListener('double(a)', onDouble1)
  t.deepEqual(Object.keys(instance.expressions), ['this', 'a', 'double(a)'])

  instance.removeListener('double(a)', onDouble2)
  t.deepEqual(Object.keys(instance.expressions), ['this'])

  t.end()

  function onDouble1 (val) {
    if (removed) return t.fail('should not be called after removed')
    t.equal(val, 2)
  }

  function onDouble2 (val) {
    if (removed) return t.fail('should not be called after removed')
    t.equal(val, 2)
  }
})
