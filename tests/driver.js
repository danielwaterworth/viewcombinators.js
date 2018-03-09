'use strict';

let util = require('util');
let fs = require('fs');
let JsDiff = require('diff');
let chalk = require('chalk');
let errorStackParser = require('error-stack-parser');

class Output {
  constructor(display) {
    this.display = display;
    this.outputs = [];
  }

  log() {
    let output = util.format.apply(null, arguments);
    this.outputs.push(output);
    if (this.display) {
      console.log(output);
    }
  }

  asJson() {
    return JSON.stringify(this.outputs, null, 4) + '\n';
  }

  check(file) {
    let contents = fs.readFileSync(file).toString();
    let expected = this.asJson();
    if (contents !== expected) {
      let diff = JsDiff.diffLines(contents, expected);
      console.log(chalk.blue(file));
      diff.forEach(function(part) {
        var color = part.added ? 'green' : part.removed ? 'red' : 'grey';
        process.stdout.write(chalk[color](part.value));
      });
    }
  }

  record(file) {
    fs.writeFileSync(file, this.asJson());
  }
}

let points = new Map();
let drivers = [];
let context = [];

function insertPoint(key, value) {
  if (points.has(key)) {
    points.set(key, [null, () => { console.error('ambiguous'); }]);
  } else {
    points.set(key, value);
  }
}

function last(x) {
  return x[x.length - 1];
}

function callerFileAndLineNumber() {
  let trace = errorStackParser.parse(new Error());
  return [trace[2].fileName, trace[2].lineNumber];
}

function driver(name, f) {
  name = (context.concat([name])).join(':');
  let [file, line] = callerFileAndLineNumber();
  let value = [name, f];
  insertPoint(line.toString(), value);
  insertPoint(file, value);
  insertPoint(file + ':' + line, value);
  let fileName = last(file.split('/'));
  insertPoint(fileName, value);
  insertPoint(fileName + ':' + line, value);
  insertPoint(name, value);
  drivers.push(value);
}

function entry() {
  let args = process.argv.slice(2);
  let mode = args[0];

  let key = args[1];
  if (key == 'all') {
    for (let [name, f] of drivers) {
      if (mode == 'observe') {
        console.log(chalk.blue(name));
      }
      let output = new Output(mode == 'observe');
      f(output);
      let fileName = 'expectations/' + name + '.json';
      if (mode == 'record') {
        output.record(fileName);
      } else if (mode == 'check') {
        output.check(fileName);
      }
    }
  } else {
    if (points.has(key)) {
      let [name, f] = points.get(key);
      let output = new Output(mode == 'observe');
      f(output);
      if (name) {
        let fileName = 'expectations/' + name + '.json';
        if (mode == 'record') {
          output.record(fileName);
        } else if (mode == 'check') {
          output.check(fileName);
        }
      }
    } else {
      console.error('no such driver');
    }
  }
}

function group(name, f) {
  context.push(name);
  f();
  context.pop();
}

function expectException(f) {
  try {
    f();
  } catch (e) {
    return e;
  }
  throw new Error("no exception");
}
module.exports.expectException = expectException;

module.exports.group = group;
module.exports.driver = driver;
module.exports.entry = entry;
