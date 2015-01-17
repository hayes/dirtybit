var Dirtybit = require('./lib/index')

var bit = Dirtybit({b: 1, foo: 2}, {
  helpers: {
    a: function(change) {return function(){change('500')}}
  }
})

var out = bit.on('( [ b, null ? "abc" : "1" + 2 + foo, !a(b.c, true)[b] ] )[4]', console.log)
bit.on('+(b[a[1]] + "456")[2]', console.log)
console.log(bit.expressions.map)
