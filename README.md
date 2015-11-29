# dirtyBit

track changes to an expressions value using dirty checking. dirtyBit breaks
your expressions into small automatic pieces which can be shared across many
expressions.

```javascript
var dirtyBit = new require('dirtybit')()

dirtybit.on('a.b + 5', function(val) {
  console.log(val)
})

dirtybit.update({a: {b: 5}}) // logs 10
dirtybit.update({a: {b: 5}}) // callback is not called
dirtybit.update({a: {b: '5'}}) // logs 55
```
### The Basics
dirtyBit starts by breaking your expressions down into 6 basics types:
* literals
* keypaths
* helpers
* operators
* parentheses
* brackets

Each of these is explained in more detail below. Each of these components
(except literals) can depend on one or more sub components. Any component that
is shared by multiple expressions will only be evaluated once when its
dependencies change.

### Literals
There are 4 backed in literals `null`, `undefined`, `true` and `false`. on top
of these dirtybit also supports `string` and `number` literals. `this` will
always return the instances current state object.

```javascript
var dirtyBit = new require('dirtybit')()

dirtybit.on('5', function(val) {
  console.log(val) // logs `5`
})
dirtybit.on('"abc"', function(val) {
  console.log(val) // logs `abc`
})
dirtybit.on('true', function(val) {
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
dirtyBit supports most of javascript's operators with a couple exceptions:
 * assignments (`=`, `+=`, etc)
 * increments (`++`, `--`)
 * bitshift (`>>>`, `<<<`) (all other bitwise operators are supported)

Operators have 3 forms:
* ternary: `{condition} ? {expression} : {expression}`
* binary: `{expression} {operator} {expression}`
* unary: `{operator}{expression}`

### helpers
helpers are user defined transforms on a set of expressions.  They follow the
following format:
```
helper_name({expression1}, {expression2}, {expressionN})
```
helpers will be updated any time their arguments change, and they may call
their callback multiple times, and do not need to be synchronus.  This is
ideal for implementing easing transforms or doing asynchronus lookups.

###### to add a helper that doubles a value:
```
dirtyBit.addHelper('double', function(change) {
  return function(n) {
    change(+n * 2)
  }
})

instance.on('double(5)', console.log) //logs 10
instance.on('double(double(5))', console.log) //logs 20
```

###### to add a helper that uses Math.pow
```
instance.addHelper('pow', function(change) {
  return function(n, x) {
    change(Match.pow(n, x))
  }
})

instance.on('pow(pow(2, 2), 2)', console.log) // logs 16
```
### Parentheses
dirtyBit follows javascript's order of operations, you can use parentheses to
ensure that operators and lookups are applied in the expected way.
`(5 * (10 - 3)) + 7` would evaluate to `42`.  Parentheses will work correctly
in combination with any other expression type. for example
`('abc' + 123).legnth === 6` would be true.

### Brackets
Bracket notation for accessing properties works as expected. `("abc")[2]` would
evaluate to `"c"`.  Again brackets will work in combination with any of the
other expressions.

### API
##### `dirtyBit(state, options)` -> instance
* state: initial state for the instance
* options:
  * helpers: an object mapping helper names to helper constructor functions

creates an dirtybit instance.

##### `instance.on(expression, callback, all, dep_of)`
* expression: the expression to track
* callback: the function to call when the expression is updated

this registers a new expression to track.  Whenever its value changes, the
callback will be called. The callback will also be called with the expressions
initial value when it was added.

##### `instance.removeListener(expression, callback)`
* expression: the expression to stop listening for
* callback: the callback passed in when the expression was registered

this will stop tracking the expression (provided there were no other handlers
tracking it).  It will also deregister any dependencies that are no longer in
use. If the callback is not provided, this will remove all callbacks for the
given expression

##### `instance.addHelper(name, constructor)`
* name: name of the helper
* constructor: a helper constructor function.

Adds a helper for use in expressions created by this instance. constructor
should implement the api below.

##### `instance.update(state)`
* state: the new state to evaluate expressions agains.

This will evaluate your expressions against the new state, and call the handlers
for any expressions that changed.

###### `helper_constructor(change)` -> update
* change: a callback to call anytime the helpers result updates
* update: will be called with the current values of the arguments it was passed.

when update is called, the helper should look at the passed in value and call
change with the helpers result.

The helper constructor will be called with the dirtyBit instance as its context
so instance methods such as register and split will be available on `this`
