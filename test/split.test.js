var split = require('../lib/split.js')
  , test = require('tape')

test(function(t) {
  t.deepEqual(
      split('a,b([,],c),d', ',')
    , ['a', 'b([,],c),d']
  )
  t.deepEqual(
      split('a,b([,],c),d', ',', ['[', ']'])
    , ['a', 'b([,],c),d']
  )
  t.deepEqual(
      split('a,b([,],c),d', ',', [['[', ']']], true)
    , ['a', 'b([,]','c)','d']
  )
  t.deepEqual(
      split('a,b([,],c),d', ',', [['[', ']'], ['(', ')']], true)
    , ['a', 'b([,],c)','d']
  )
  t.deepEqual(
      split('a,b{([,],c),d}', ',', null, true)
    , ['a', 'b{([,],c)', 'd}']
  )
  t.deepEqual(
      split('a ? b : c : d ? e : f', ':', [['?', ':']], true)
    , ['a ? b : c ', ' d ? e : f']
  )
  t.end()
})
