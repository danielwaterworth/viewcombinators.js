'use strict';

let util = require('util');
let { left, right, either } = require('./util.js');

class Seq {
  static empty() {
    return new Empty();
  }

  static singleton(x) {
    return new Leaf(x);
  }

  static join(x, y) {
    if (x.constructor == Empty) {
      return y;
    } else if (y.constructor == Empty) {
      return x;
    } else if (x.depth == y.depth) {
      return new Branch2(x, y);
    } else if (x.depth < y.depth) {
      return either(
        y.joinBefore(x),
        x => x,
        ([x, y]) => new Branch2(x, y)
      );
    } else {
      return either(
        x.joinAfter(y),
        x => x,
        ([x, y]) => new Branch2(x, y)
      );
    }
  }

  static fromList(items) {
    let output = Seq.empty();
    for (let item of items) {
      output = Seq.join(output, Seq.singleton(item));
    }
    return output;
  }

  insertAt(i, x) {
    return either(
      this._insertAt(i, x),
      x => x,
      ([a, b]) => new Branch2(a, b)
    );
  }

  head() {
    return this.get(0);
  }
}
module.exports.Seq = Seq;

class Branch2 extends Seq {
  constructor(x0, x1) {
    super();
    this.x0 = x0;
    this.s0 = x0.size;
    this.x1 = x1;
    this.s1 = x0.size + x1.size;
    this.depth = x0.depth + 1;
  }

  get size() {
    return this.s1;
  }

  take(n) {
    if (n == 0) {
      return Seq.empty();
    } else if (n < this.s0) {
      return this.x0.take(n);
    } else if (n == this.s0) {
      return this.x0;
    } else if (n < this.s1) {
      return Seq.join(this.x0, this.x1.take(n - this.s0));
    } else if (n == this.s1) {
      return this;
    } else {
      throw new RangeError('not enough items');
    }
  }

  drop(n) {
    if (n == 0) {
      return this;
    } else if (n < this.s0) {
      return Seq.join(this.x0.drop(n), this.x1);
    } else if (n == this.s0) {
      return this.x1;
    } else if (n < this.s1) {
      return this.x1.drop(n - this.s0);
    } else if (n == this.s1) {
      return Seq.empty();
    } else {
      throw new RangeError('not enough items');
    }
  }

  joinAfter(x) {
    if (x.depth == this.depth - 1) {
      return left(
        new Branch3(
          this.x0,
          this.x1,
          x
        )
      );
    } else {
      return either(
        this.x1.joinAfter(x),
        x1 =>
          left(
            new Branch2(
              this.x0,
              x1
            )
          ),
        ([x1a, x1b]) =>
          left(
            new Branch3(
              this.x0,
              x1a,
              x1b
            )
          )
      );
    }
  }

  joinBefore(x) {
    if (x.depth == this.depth - 1) {
      return left(new Branch3(
        x,
        this.x0,
        this.x1
      ));
    } else {
      return either(
        this.x0.joinBefore(x),
        x0 =>
          left(
            new Branch2(
              x0,
              this.x1
            )
          ),
        ([x0a, x0b]) =>
          left(
            new Branch3(
              x0a,
              x0b,
              this.x1
            )
          )
      );
    }
  }

  _insertAt(i, x) {
    if (i < this.s0) {
      return either(
        this._insertAt(i, this.x0),
        x0 => new Branch2(x0, this.x1),
        ([x0a, x0b]) => new Branch3(x0a, x0b, this.x1)
      );
    } else if (i < this.s1) {
      return either(
        this._insertAt(i - this.s0, this.x1),
        x1 => left(new Branch2(this.x0, x1)),
        ([x1a, x1b]) => left(new Branch3(this.x0, x1a, x1b))
      );
    } else {
      throw new RangeError('out of range');
    }
  }

  get(i) {
    if (i < this.s0) {
      return this.x0.get(i);
    } else if (i < this.s1) {
      return this.x1.get(i - this.s0);
    } else {
      throw new RangeError('out of range');
    }
  }
}

class Branch3 extends Seq {
  constructor(x0, x1, x2) {
    super()
    this.x0 = x0;
    this.s0 = x0.size;
    this.x1 = x1;
    this.s1 = x0.size + x1.size;
    this.x2 = x2;
    this.s2 = x0.size + x1.size + x2.size;
    this.depth = x0.depth + 1;
  }

  get size() {
    return this.s2;
  }

  take(n) {
    if (n == 0) {
      return Seq.empty();
    } else if (n < this.s0) {
      return this.x0.take(n);
    } else if (n == this.s0) {
      return this.x0;
    } else if (n < this.s1) {
      return Seq.join(this.x0, this.x1.take(n - this.s0));
    } else if (n == this.s1) {
      return Seq.join(this.x0, this.x1);
    } else if (n < this.s2) {
      return Seq.join(Seq.join(this.x0, this.x1), this.x2.take(n - this.s1));
    } else if (n == this.s2) {
      return this;
    } else {
      throw new RangeError('not enough items');
    }
  }

  drop(n) {
    if (n == 0) {
      return this;
    } else if (n < this.s0) {
      return Seq.join(this.x0.drop(n), Seq.join(this.x1, this.x2));
    } else if (n == this.s0) {
      return Seq.join(this.x1, this.x2);
    } else if (n < this.s1) {
      return Seq.join(this.x1.drop(n - this.s0), this.x2)
    } else if (n == this.s1) {
      return this.x2;
    } else if (n < this.s2) {
      return this.x2.drop(n - this.s1);
    } else if (n == this.s2) {
      return Seq.empty();
    } else {
      throw new RangeError('not enough items');
    }
  }

  joinAfter(x) {
    if (x.depth == this.depth - 1) {
      return right([
        new Branch2(
          this.x0,
          this.x1
        ),
        new Branch2(
          this.x2,
          x
        )
      ]);
    } else {
      return either(
        this.x2.joinAfter(x),
        x2 =>
          left(
            new Branch3(
              this.x0,
              this.x1,
              x2
            )
          ),
        ([x2a, x2b]) =>
          right([
            new Branch2(
              x0,
              x1
            ),
            new Branch2(
              x2a,
              x2b
            )
          ])
      );
    }
  }

  joinBefore(x) {
    if (x.depth == this.depth - 1) {
      return right([
        new Branch2(
          x,
          this.x0
        ),
        new Branch2(
          this.x1,
          this.x2
        )
      ]);
    } else {
      return either(
        this.x0.joinBefore(x),
        x0 =>
          left(
            new Branch3(
              x0,
              this.x1,
              this.x2
            )
          ),
        ([x0a, x0b]) =>
          right([
            new Branch2(
              x0a,
              x0b
            ),
            new Branch2(
              x1,
              x2
            )
          ])
      )
    }
  }

  _insertAt(i, x) {
    if (i < this.s0) {
      return either(
        this.x0._insertAt(i, x),
        x0 => left(new Branch3(x0, this.x1, this.x2)),
        ([x0a, x0b]) =>
          right(
            new Branch2(x0a, x0b),
            new Branch2(this.x1, this.x2)
          )
      );
    } else if (i < this.s1) {
      return either(
        this.x1._insertAt(i - this.s0, x),
        x1 => left(new Branch3(this.x0, x1, this.x2)),
        ([x1a, x1b]) =>
          right(
            new Branch2(this.x0, x1a),
            new Branch2(x1b, this.x2)
          )
      );
    } else if (i < this.s2) {
      return either(
        this.x2._insertAt(i - this.s1, x),
        x2 => left(new Branch3(this.x0, this.x1, x2)),
        ([x2a, x2b]) =>
          right(
            new Branch2(this.x0, this.x1),
            new Branch2(x2a, x2b)
          )
      );
    } else {
      throw new RangeError('out of range');
    }
  }

  get(i) {
    if (i < this.s0) {
      return this.x0.get(i);
    } else if (i < this.s1) {
      return this.x1.get(i - this.s0);
    } else if (i < this.s2) {
      return this.x2.get(i - this.s1);
    } else {
      throw new RangeError('out of range');
    }
  }
}

class Leaf extends Seq {
  constructor(x) {
    super()
    this.x = x;
  }

  get size() {
    return 1;
  }

  get depth() {
    return 1;
  }

  take(n) {
    if (n == 0) {
      return Seq.empty();
    } else if (n == 1) {
      return this;
    } else {
      throw new RangeError('not enough items');
    }
  }

  drop(n) {
    if (n == 0) {
      return this;
    } else if (n == 1) {
      return Seq.empty();
    } else {
      throw new RangeError('not enough items');
    }
  }

  joinAfter(x) {
    throw "not reachable";
  }

  joinBefore(x) {
    throw "not reachable";
  }

  _insertAt(i, x) {
    if (i == 0) {
      return right([
        new Leaf(x),
        this
      ]);
    } else if (i == 1) {
      return right([
        this,
        new Leaf(x)
      ]);
    } else {
      throw new RangeError('out of range');
    }
  }

  get(i) {
    if (i == 0) {
      return this.x;
    } else {
      throw new RangeError('out of range');
    }
  }
}

class Empty extends Seq {
  get size() {
    return 0;
  }

  get depth() {
    return 0;
  }

  take(n) {
    if (n == 0) {
      return this;
    } else {
      throw new RangeError('not enough items');
    }
  }

  drop(n) {
    if (n == 0) {
      return this;
    } else {
      throw new RangeError('not enough items');
    }
  }

  head() {
    throw new Error('head of empty Seq');
  }

  joinAfter(x) {
    throw "not reachable";
  }

  joinBefore(x) {
    throw "not reachable";
  }

  _insertAt(i, x) {
    if (i == 0) {
      return left(new Leaf(x));
    } else {
      throw new RangeError('out of range');
    }
  }

  get(i) {
    throw new RangeError('out of range');
  }
}
