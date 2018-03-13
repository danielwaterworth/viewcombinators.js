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

class Left {
  constructor(x) {
    this.x = x;
  }
}

class Right {
  constructor(x) {
    this.x = x;
  }
}

function left(x) {
  return new Left(x);
}
module.exports.left = left;

function right(x) {
  return new Right(x);
}
module.exports.right = right;

function either(x, f, g) {
  if (x.constructor === Left) {
    return f(x.x);
  } else if (x.constructor === Right) {
    return g(x.x);
  } else {
    throw new TypeError("expected Either");
  }
}
module.exports.either = either;

class Nothing {}
module.exports.nothing = new Nothing();

class Just {
  constructor(x) {
    this.x = x;
  }
}

function just(x) {
  return new Just(x);
}
module.exports.just = just;

function maybe(x, f, g) {
  if (x.constructor === Just) {
    return f(x.x);
  } else if (y.constructor === Nothing) {
    return g();
  } else {
    throw new TypeError("expected Either");
  }
}
module.exports.maybe = maybe;
