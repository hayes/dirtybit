module.exports = List

function List () {
  this.head = null
  this.tail = null
}

List.prototype.add = function add (value) {
  if (this.tail) {
    this.tail = this.tail.next = new ListItem(this, value, this.tail)
  } else {
    this.head = this.tail = new ListItem(this, value, null)
  }

  return this.tail
}

function ListItem (list, value, prev) {
  this.list = list
  this.value = value
  this.prev = prev
  this.next = null
}

ListItem.prototype.remove = function () {
  if (this === this.list.head) this.list.head = this.next
  if (this === this.list.tail) this.list.tail = this.prev
  if (this.prev) this.prev.next = this.next
  if (this.next) this.next.prev = this.prev
}
