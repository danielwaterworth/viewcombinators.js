'use strict';

let { last } = require('./util.js');

class ShowList {
  constructor(items) {
    this.items = items;
  }

  showSingleLine(output) {
    if (this.items.length == 0) {
      output.log("[]");
    } else {
      output.log("[ ");
      for (let item of this.items.slice(0, this.items.length - 1)) {
        item.showSingleLine(output);
        output.log(", ");
      }
      last(this.items).showSingleLine(output);
      output.log(" ]");
    }
  }

  showMultiLine(output) {
    if (this.items.length == 0) {
      output.log("[]");
    } else {
      output.log("[");
      output.indent(() => {
        output.log("\n");
        for (let item of this.items.slice(0, this.items.length - 1)) {
          item.showSingleLine(output);
          output.log(",\n");
        }
        last(this.items).showSingleLine(output);
      });
      output.log("\n]");
    }
  }
}
module.exports.ShowList = ShowList;

class ShowMap {
  constructor(items) {
    this.items = items;
  }

  showSingleLine(output) {
    if (this.items.size == 0) {
      output.log("{}");
    } else {
      output.log("{ ");
      let items = Array.from(this.items.entries());
      for (let [key, value] of items.slice(0, items.length - 1)) {
        output.log(key);
        output.log(": ");
        value.showSingleLine(output);
        output.log(", ");
      }
      let [key, value] = last(items);
      output.log(key);
      output.log(": ");
      value.showSingleLine(output);
      output.log(" }");
    }
  }

  showMultiLine(output) {
    if (this.items.size == 0) {
      output.log("{}");
    } else {
      output.log("{");
      output.indent(() => {
        output.log("\n");
        let items = Array.from(this.items.entries());
        for (let [key, value] of items.slice(0, items.length - 1)) {
          output.log(key);
          output.log(": ");
          output.show(value);
          output.log(",\n");
        }
        let [key, value] = last(items);
        output.log(key);
        output.log(": ");
        output.show(value);
      });
      output.log("\n}");
    }
  }
}
module.exports.ShowMap = ShowMap;

class Output {
  constructor() {
    this.lines = [[]];
    this.indentLevel = 0;
  }

  log(string) {
    let lines = string.split("\n");
    let segment = lines.shift();
    last(this.lines).push(segment);
    if (lines.length > 0) {
      for (let line of lines) {
        this.lines.push([' '.repeat(this.indentLevel), line]);
      }
    }
  }

  indent(f) {
    this.indentLevel += 2;
    f();
    this.indentLevel -= 2;
  }

  _lastLineLength() {
    return last(this.lines).map(x => x.length).reduce((x, y) => x + y, 0);
  }

  show(obj) {
    let numLines = this.lines.length;
    let numSegments = last(this.lines).length;
    obj.showSingleLine(this);
    if (this._lastLineLength() > 80) {
      this.lines = this.lines.slice(0, numLines);
      this.lines[this.lines.length - 1] =
        last(this.lines).slice(0, numSegments);
      obj.showMultiLine(this);
    }
  }

  finish() {
    return this.lines.map(x => x.join('')).join('\n');
  }
}
module.exports.Output = Output;
