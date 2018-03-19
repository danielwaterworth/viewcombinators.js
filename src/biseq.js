'use strict';

let { Seq } = require('./seq.js');

class BiSeq {
  constructor() {
    this.seq = Seq.empty();
    this.map = new Map();
  }

  insertAt(x, i) {
    let leaf = Seq.singleton(x);
    this.map.set(x, leaf);
    this.seq = this.seq.insertSequenceAt(leaf, i);
  }

  replaceAt(x, i) {
    this.deletePosition(i);
    this.insertAt(x, i);
  }

  getPosition(x) {
    return this.map.get(x).getPosition();
  }

  getValue(i) {
    return this.seq.get(i);
  }

  deletePosition(i) {
    let x = this.seq.get(i);
    this.map.delete(x);
    this.seq = this.seq.delete(i);
  }

  deleteValue(x) {
    this.deletePosition(this.getPosition(x));
  }
}
module.exports.BiSeq = BiSeq;
