var dirtyBit = require('../lib/index')({bar: 10})
var test = require('tape')

dirtyBit.addHelper('foo', foo)

dirtyBit.on('bar', function(){})
dirtyBit.on('foo(bar, "foo")', function(args) {
  console.log('1', args)
})

function foo(change) {
  return function(a, b) {
    setTimeout(function() {
      change(a + b)
    }, 10)
  }
}
