# dirtyBit

track changes to an expressions value using dirty checking. dirtyBit breaks
your expressions into small automic peices which can be shared across many
expressions.

```javascript
var dirtyBit = new require('dirtybit')()

dirtybit.register('a.b + 5', function(val) {
  console.log(val)
})

dirtybit.update({a: {b: 5}}) // logs 10
dirtybit.update({a: {b: 5}}) // callback is not called
dirtybit.update({a: {b: '5'}}) // logs 55
```
### The Basics
dirtyBit starts by breaking your expressions down into 6 basics types:
* litterals
* keypaths
* filters
* operators
* parentheses
* brackets

Each of these is explained in more detail below. Each of these components
(except litterals) can depend on one or more sub components. Any component that
is shared by multiple expressions will only be evaluated once when its
dependencies change.

### Litterals
There are 4 backed in litterals `null`, `undefined`, `true` and `false`. ontop
of these dirtybit also supports `string` and `number` litterals. `this` will
always return the instances current state object.

```javascript
var dirtyBit = new require('dirtybit')()

dirtybit.register('5', function(val) {
  console.log(val) // logs `5`
})
dirtybit.register('"abc"', function(val) {
  console.log(val) // logs `abc`
})
dirtybit.register('true', function(val) {
  console.log(val) // logs `true`
})
```

### keypaths
a key path is a series of keys joined by a dot that represent a path to a value
nested in an object. (eg. `a.b.c` would return 5 from `{a: b: {c: 5}}`).

dirty bit allows keypaths into the result of any other expression. So a key
path is any express that follows the following pattern:
`{expression}.your_key`. `{expression}` could be a string `"abc".length` it
could be a number: `5.constructor` or it could be another key path: `a.b.c`.

### Operators
dirtyBit supports most of javascripts operators with a couple exceptions:
 * assingments (`=`, `+=`, etc)
 * increments (`++`, `--`)
 * bitshift (`>>>`, `<<<`) (all other bitwise operators are supported)

Operators have 3 forms:
* ternary: `{condition} ? {expression} : {expression}`
* binary: `{expression} {operator} {expression}`
* unary: `{operator}{expression}`

### Filters
filters are user defined transforms on a set of expressions.  They follow the
follwing format:
```
filter_name({expression1}, {expression2}, {expressionN})
```
Filters will be updated any time their arguments change, and they may call
theie callback multiple times, and do not need to be synchronus.  This is
ideal for implementing easing transforms or doing asynchronus lookups.

###### to add a filter that doubles a value:
```
dirtyBit.addFilter('double', function(args, change) {
  return function(n) {
    change(+n * 2)
  }
})

accessors.register('double(5)', console.log) //logs 10
accessors.register('double(double(5))', console.log) //logs 20
```

###### to add a filter that uses Math.pow
```
accessors.addFilter('pow', function(args, change) {
  return function(n, x) {
    change(Match.pow(n, x))
  }
})

accessors.register('pow(pow(2, 2), 2)', console.log) // logs 16
```
### Parentheses
dirtyBit follows javascripts order of operations, you can use parentheses to
ensure that operators and lookups are applied in the exprected way.
`(5 * (10 - 3)) + 7` would evaluate to `42`.  Parentheses will work correctly
in combination with any other expression type. for example
`('abc' + 123).legnth === 6` would be true.

### Brackets
Bracket notation for accessing properies works as expected. `("abc")[2]` would
evaluate to `"c"`.  Again brackets will work in combination with any of the
other expressions.

### API
##### `dirtyBit(state, options)` -> instance
* state: initial state for the instance
* options:
  * filters: an abjenct mapping filter names to filter constructor functions
  * rootKey: a value that will access the current state, defaults to `'this'`

creates an accessors instance.

##### `instance.register(expression, callback, all, dep_of)`
* exression: the expression to track
* callback: the function to call when the expression is updated
* all: if true, the callback will be called any time the sate updates even if
the expressions value did not.
* dep_of: for internal use, indicates it is a dependency of another expression

this registers a new expression to track.  Whenever its value changes, the
callback will be called. The callback will also be called with the expressions
initial value when it was added.

##### `instance.deregister(expression, callback)`
* exression: the expression to deregister
* callback: the callback passed in when the expression was registered

this will stop tracking the expression (provided there were no other handlers
tracking it).  It will also deregister any dependencies that are no longer in
use.

##### `instance.addFilter(name, constructor)`
* name: name of the filter
* constructor: a filter constructor function.

Adds a filter for use in expressions created by this insance. constructor
should implement the api below.

##### `instance.update(state)`
* state: the new state to evaluate expressions agains.

This will evaluate your expressions against the new state, and call the handlers
for any expressions that changed.

###### `filter_constructor(change)` -> update
* change: a callback to call anytime the filters result updates
* update: will be called with the current values of the arguments it was passed.

when update is called, the filter should look at the passed in value and call
change with the filters result.

The filter constructor will be called with the dirtyBit instance as its context
so instance methods such as register and split will be avaialbe on `this`

##### `instance.split(str, key, pairs, all)` -> Array of strings
* str: the original string to split
* key: the key to split on
* all: like the g flag in a regexp, if true will split all rather just on the
 first instance of key
* pairs: an array of arrays. inner arrays should contain 2 single character
strings.  defaults to [['(', ')']]. if the 3rd item in the array is truthy,
the split will ignore all other pairs until the current pair is closed.

Splits a string on a key, but does not split in the middle of matching pairs
(parens by default).
