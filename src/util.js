'use strict';

function last(arr) {
  return arr[arr.length - 1];
}
module.exports.last = last;

function* mapIterator(iterator, mapping) {
  while (true) {
    let result = iterator.next();
    if (result.done) {
      break;
    }
    yield mapping(result.value);
  }
}
module.exports.mapIterator = mapIterator;
