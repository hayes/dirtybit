var valid_path = /^(.*)\.([^.\s]+)$/

module.exports = create
module.exports.parse = parse

function parse(lookup) {
  var parts = lookup.match(valid_path)

  return parts ?
    {deps: [parts[1]], options: parts[2]} :
    {deps: ['this'], options: lookup}
}

function create(change, key) {
  return function(obj) {
    if(obj === null || obj === undefined) {
      return change()
    }

    change(obj[key])
  }
}
