var brackets = require('./brackets')
var dot_path = require('./dot-path')
var filters = require('./filters')
var partial = require('./partial')
var ternary = require('./ternary')
var parens = require('./parens')
var values = require('./values')
var binary = require('./binary')
var unary = require('./unary')
var list = require('./list')

module.exports.order = [
    'values'
  , 'filters'
  , 'partial'
  , 'parens'
  , 'ternary'
  , 'binary'
  , 'unary'
  , 'brackets'
  , 'list'
  , 'dot_path'
]

module.exports.types = {
    values: values
  , filters: filters
  , partial: partial
  , parens: parens
  , ternary: ternary
  , binary: binary
  , unary: unary
  , brackets: brackets
  , list: list
  , dot_path: dot_path
}
