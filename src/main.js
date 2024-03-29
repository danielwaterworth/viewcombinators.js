'use strict';

let { mapIterator, last } = require('./util.js');
let show = require('./show.js');
let { Seq } = require ('./seq.js');

module.exports.Seq = Seq;

let constructors = new Map();

function register(name, f) {
  constructors.set(name, f);
}

function makeReactive(desc) {
  if (desc.type === undefined) {
    throw new Error("not a descriptor");
  }
  return constructors.get(desc.type)(desc);
}
module.exports.makeReactive = makeReactive;

class RValue {
  constructor(value) {
    this.value = value;
  }

  applyChanges(changes) {
    this.value = last(changes);
  }

  copy() {
    return new RValue(this.value);
  }

  toDescriptor() {
    return {
      'type': 'value',
      'value': this.value
    }
  }

  showSingleLine(output) {
    output.log("RValue { value: ")
    output.log(JSON.stringify(this.value));
    output.log(" }");
  }

  showMultiLine(output) {
    output.log("RValue {");
    output.indent(() => {
      output.log("\nvalue: ")
      output.log(JSON.stringify(this.value));
    });
    output.log("\n}");
  }
}
module.exports.RValue = RValue;

register('value', desc => {
  return new RValue(desc.value);
});

class RLog {
  constructor(value) {
    this.value = value;
  }

  applyChanges(changes) {
    for (let change of changes) {
      if (change.type == 'push') {
        this.value.push(makeReactive(change.value));
      }
    }
  }

  last() {
    return last(this.value);
  }

  size() {
    return this.value.length;
  }

  copy() {
    return new RLog(this.value.map(x => x.copy()));
  }

  toDescriptor() {
    return {
      'type': 'log',
      'items': this.value.map(x => x.toDescriptor())
    }
  }

  showSingleLine(output) {
    output.log("RLog { items: ");
    let showList = new show.ShowList(this.value);
    showList.showSingleLine(output);
    output.log(" }");
  }

  showMultiLine(output) {
    output.log("RLog {");
    output.indent(() => {
      output.log("\nitems: ");
      let showList = new show.ShowList(this.value);
      output.show(showList);
    });
    output.log("\n}");
  }
}
module.exports.RLog = RLog;

register('log', desc => {
  let items = desc.items.map(makeReactive);
  return new RLog(items);
});

class RStack {
  constructor(value) {
    this.value = value;
  }

  applyChanges(changes) {
    for (let change of changes) {
      if (change.type == 'push') {
        this.value.push(makeReactive(change.value));
      } else if (change.type == 'pop') {
        this.value.pop();
      } else if (change.type == 'modify') {
        last(this.value).applyChanges(change.valueChanges);
      }
    }
  }

  last() {
    return last(this.value);
  }

  size() {
    return this.value.length;
  }

  copy() {
    return new RStack(this.value.map(x => x.copy()));
  }

  toDescriptor() {
    return {
      'type': 'stack',
      'items': this.value.map(x => x.toDescriptor())
    }
  }

  showSingleLine(output) {
    output.log("RStack { items: ");
    let showList = new show.ShowList(this.value);
    showList.showSingleLine(output);
    output.log(" }");
  }

  showMultiLine(output) {
    output.log("RStack {");
    output.indent(() => {
      output.log("\nitems: ");
      let showList = new show.ShowList(this.value);
      output.show(showList);
    });
    output.log("\n}");
  }
}
module.exports.RStack = RStack;

register('stack', desc => {
  let items = desc.items.map(makeReactive);
  return new RStack(items);
});

class RMap {
  constructor(initialValue) {
    this.value = initialValue;
  }

  applyChanges(changes) {
    for (let change of changes) {
      if (change.type == 'set') {
        this.value.set(change.key, makeReactive(change.value));
      } else if (change.type == 'modify') {
        this.value.get(change.key).applyChanges(change.valueChanges);
      } else if (change.type == 'delete') {
        this.value.delete(change.key);
      }
    }
  }

  has(key) {
    return this.value.has(key);
  }

  get(key) {
    return this.value.get(key);
  }

  copy() {
    return new RMap(new Map(this.value.entries()));
  }

  toDescriptor() {
    let items =
      mapIterator(
        this.value.entries(),
        ([key, value]) => [key, value.toDescriptor()]
      );

    return {
      'type': 'map',
      'items': new Map(items)
    }
  }

  showSingleLine(output) {
    output.log("RMap { items: ");
    let showMap = new show.ShowMap(this.value);
    showMap.showSingleLine(output);
    output.log(" }");
  }

  showMultiLine(output) {
    output.log("RMap {");
    output.indent(() => {
      output.log("\nitems: ");
      let showMap = new show.ShowMap(this.value);
      output.show(showMap);
    });
    output.log("\n}");
  }

  toString() {
    let output = new show.Output();
    output.show(this);
    return output.finish();
  }
}
module.exports.RMap = RMap;

register('map', desc => {
  let keyedItemDescs =
    desc.items.entries();
  let keyedReactives =
    mapIterator(keyedItemDescs, ([key, value]) => [key, makeReactive(value)]);
  let items =
    new Map(keyedReactives)
  return new RMap(items);
});

class RSeq {
  constructor(initialValue) {
    this.value = initialValue;
  }

  applyChanges(changes) {
    for (let change of changes) {
      if (change.type == 'insert') {
        this.value =
          this.value.insertAt(
            change.index,
            makeReactive(change.value)
          );
      } else if (change.type == 'delete') {
        this.value = this.value.deleteRange(change.startAt, change.size);
      } else if (change.type == 'modify') {
        this.value.get(change.i).applyChanges(change.valueChanges);
      } else if (change.type == 'move') {
        let range = this.value.getRange(change.from, change.size);
        this.value = this.value.deleteRange(change.from, change.size);
        this.value = this.value.insertRange(change.to, range);
      }
    }
  }
}
module.exports.RSeq = RSeq;

register('sequence', desc => {
  let items = Seq.fromList(desc.items.map(makeReactive));
  return new RSeq(items);
});

class RRecord {
  constructor(initialValue) {
    this.value = initialValue;
  }

  applyChanges(changes) {
    for (let change of changes) {
      this.value.get(change.key).applyChanges(change.valueChanges);
    }
  }

  get(key) {
    return this.value.get(key);
  }

  copy() {
    return new RMap(new Map(this.value.entries()));
  }
}
module.exports.RRecord = RRecord;

register('record', desc => {
  return new RMap(new Map(desc.fields.entries()));
});

class Input {
  constructor(value) {
    this.value = value;
    this.invalidateHandlers = [];
    this.readyHandlers = [];
    this.valid = true;
  }

  getValue() {
    return this.value;
  }

  _invalidate() {
    this.valid = false;
    for (let handler of this.invalidateHandlers) {
      handler();
    }
  }

  _ready(changes) {
    this.valid = true;
    for (let handler of this.readyHandlers) {
      handler(changes);
    }
  }

  applyChanges(changes) {
    this._invalidate();
    this.value.applyChanges(changes);
    this._ready(changes);
  }

  onInvalidate(handler) {
    this.invalidateHandlers.push(handler);
  }

  onReady(handler) {
    this.readyHandlers.push(handler);
  }
}
module.exports.Input = Input;

class InputLog {
  constructor() {
    this.input = new Input(new RLog([]));
  }

  push(x) {
    this.input.applyChanges([{
      'type': 'push',
      'value': x
    }]);
  }

  onInvalidate(handler) {
    this.input.onInvalidate(handler);
  }

  onReady(handler) {
    this.input.onReady(handler);
  }

  getValue() {
    return this.input.getValue();
  }
}
module.exports.InputLog = InputLog;

class MapValue {
  constructor(inputValues, f) {
    this.f = f;
    this.value = new RValue(f(inputValues[0].value));
  }

  applyInputsChanges(changes) {
    let outputChanges = [];
    outputChanges.push(this.f(last(changes[0])));
    this.value.applyChanges(outputChanges);
    return outputChanges;
  }

  getValue() {
    return this.value;
  }
}

function mapValue(f) {
  return inputValues => new MapValue(inputValues, f);
}
module.exports.mapValue = mapValue;

class TransformStackValues {
  constructor(inputValues, transformation) {
    let inputStack = inputValues[0];
    this.transformation = transformation;
    this.transforms =
      inputStack.value.map(input => transformation([input]));
    this.value =
      new RStack(this.transforms.map(transform => transform.getValue()));
  }

  applyInputsChanges(changes) {
    let outputChanges = [];
    for (let change of changes[0]) {
      if (change.type == 'push') {
        let initial = makeReactive(change.value);
        this.transforms.push(this.transformation([initial]));
        outputChanges.push({
          'type': 'push',
          'value': last(this.transforms).getValue().toDescriptor()
        })
      } else if (change.type == 'pop') {
        this.transforms.pop();
        outputChanges.push({
          'type': 'pop'
        });
      } else if (change.type == 'modify') {
        let valueChanges =
          last(this.transforms).applyInputsChanges([change.valueChanges]);
        outputChanges.push({
          'type': 'modify',
          'valueChanges': valueChanges
        })
      }
    }
    this.value.applyChanges(outputChanges);
    return outputChanges;
  }

  getValue() {
    return this.value;
  }
}

function transformStackValues(transformation) {
  return inputValues => new TransformStackValues(inputValues, transformation);
}
module.exports.transformStackValues = transformStackValues;

class MapStackValues {
  constructor(inputValues, f) {
    this.inputStack = inputValues[0].copy();
    this.f = f;
    this.value =
      new RStack(this.inputStack.value.map(f));
  }

  applyInputsChanges(changes) {
    let outputChanges = [];
    for (let change of changes[0]) {
      this.inputStack.applyChanges([change]);
      if (change.type == 'push') {
        let value = this.f(makeReactive(change.value)).toDescriptor();
        outputChanges.push({
          'type': 'push',
          'value': value
        });
      } else if (change.type == 'pop') {
        outputChanges.push({'type': 'pop'});
      } else if (change.type == 'modify') {
        let lastValue = this.inputStack.last();
        lastValue = this.f(lastValue);
        outputChanges.push({'type': 'pop'});
        outputChanges.push({
          'type': 'push',
          'value': lastValue.toDescriptor()
        });
      }
    }
    this.value.applyChanges(outputChanges);
    return outputChanges;
  }

  getValue() {
    return this.value;
  }
}

function mapStackValues(f) {
  return inputValues => new MapStackValues(inputValues, f);
}
module.exports.mapStackValues = mapStackValues;

class FilterStack {
  constructor(inputValues, f) {
    this.inputStack = inputValues[0].copy();
    this.f = f;
    this.results = this.inputStack.value.map(f);
    this.value = new RStack(this.inputStack.value.filter(f));
  }

  applyInputsChanges(changes) {
    let outputChanges = [];
    for (let change of changes[0]) {
      this.inputStack.applyChanges([change]);
      if (change.type == 'push') {
        let result = this.f(change.value);
        this.results.push(result);
        if (result) {
          let outputChange = {'type': 'push', 'value': change.value};
          outputChanges.push(outputChange);
        }
      } else if (change.type == 'pop') {
        let result = this.results.pop();
        if (result) {
          let outputChange = {'type': 'pop'};
          outputChanges.push(outputChange);
        }
      } else if (change.type == 'modify') {
        let prevResult = last(this.results);
        this.results.pop();
        let result = this.f(this.inputStack.last());
        this.results.push(result);

        if (prevResult) {
          if (result) {
            let outputChange = {
              'type': 'modify',
              'valueChanges': change.valueChanges
            };
            outputChanges.push(outputChange);
          } else {
            let outputChange = {
              'type': 'pop'
            };
            outputChanges.push(outputChange);
          }
        } else {
          if (result) {
            let outputChange = {
              'type': 'push',
              'value': this.inputStack.last().toDescriptor()
            }
            outputChanges.push(outputChange);
          }
        }
      }
    }
    this.value.applyChanges(outputChanges);
    return outputChanges;
  }

  getValue() {
    return this.value;
  }
}

function filterStack(f) {
  return inputValues => new FilterStack(inputValues, f);
}
module.exports.filterStack = filterStack;

class StackToMap {
  constructor(inputValues) {
    this.inputStack = new RStack([]);
    this.lostValues = [];
    this.hasLostValues = [];
    this.value = new RMap(new Map());

    for (let value of inputValues[0].value) {
      this._handlePush(value.value);
    }
  }

  _handlePush(record) {
    let [key, value] = record;
    this.hasLostValues.push(this.value.has(key));
    if (last(this.hasLostValues)) {
      this.lostValues.push(this.value.get(key));
    }
    let outputChange = {
      'type': 'set',
      'key': key,
      'value': {'type': 'value', 'value': value}
    }
    this.value.applyChanges([outputChange]);
    this.inputStack.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': record}}
    ]);
    return outputChange;
  }

  _handlePop() {
    let hasLostValue = this.hasLostValues.pop();
    let [key, _] = this.inputStack.value.pop().value;
    let outputChange;
    if (hasLostValue) {
      let value = this.lostValues.pop();

      this.value.value.set(key, value);
      outputChange = {
        'type': 'set',
        'key': key,
        'value': value.toDescriptor()
      }
    } else {
      outputChange = {
        'type': 'delete',
        'key': key
      }
    }
    this.value.applyChanges([outputChange]);
    return outputChange;
  }

  applyInputsChanges(changes) {
    let outputChanges = [];
    for (let change of changes[0]) {
      if (change.type == 'push') {
        outputChanges.push(this._handlePush(change.value.value));
      } else if (change.type == 'pop') {
        outputChanges.push(this._handlePop());
      } else if (change.type == 'modify') {
        let record = this.inputStack.last();
        outputChanges.push(this._handlePop());
        record.applyChanges(change.valueChanges);
        outputChanges.push(this._handlePush(record.value));
      }
    }
    return outputChanges;
  }

  getValue() {
    return this.value;
  }
}

function stackToMap() {
  return inputValues => new StackToMap(inputValues);
}
module.exports.stackToMap = stackToMap;

class StackToSequence {
  constructor(inputValues) {
    this.value = new RSeq(Seq.empty());
  }

  _handlePush(x) {
    
  }

  applyInputsChanges(changes) {
    for (let change of changes[0]) {
      if (change.type == 'push') {

      } else if (change.type == 'pop') {

      } else if (change.type == 'modify') {

      }
    }
  }

  getValue() {
    return this.value;
  }
}

function stackToSequence() {
  return inputValues => new StackToSequence(inputValues);
}
module.exports.stackToSequence = stackToSequence;

class GroupStackBy {
  constructor(inputValues, f) {
    this.inputStack = inputValues[0].copy();
    this.f = f;
    this.value = new RMap(new Map());
    for (let value of this.inputStack.value) {
      this._handlePush(value);
    }
  }

  applyInputsChanges(changes) {
    let outputChanges = [];
    for (let change of changes[0]) {
      let roundChanges = [];
      if (change.type == 'push') {
        let value = makeReactive(change.value)
        let key = this.f(value);
        if (!this.value.has(key)) {
          roundChanges.push({
            'type': 'set',
            'key': key,
            'value': {
              'type': 'stack',
              'items': []
            }
          });
        }
        roundChanges.push({
          'type': 'modify',
          'key': key,
          'valueChanges': [
            {'type': 'push', 'value': change.value},
          ]
        });
        this.inputStack.applyChanges([change]);
      } else if (change.type == 'pop') {
        let value = this.inputStack.last();
        let key = this.f(value);
        let stack = this.value.get(key)
        if (stack.size() == 1) {
          roundChanges.push({
            'type': 'delete',
            'key': key
          });
        } else {
          roundChanges.push({
            'type': 'modify',
            'key': key,
            'valueChanges': [
              {'type': 'pop'}
            ]
          });
        }
        this.inputStack.applyChanges([change]);
      } else if (change.type == 'modify') {
        let prevKey = this.f(this.inputStack.last());
        this.inputStack.applyChanges([change]);
        let newKey = this.f(this.inputStack.last());
        if (prevKey == newKey) {
          roundChanges.push({
            'type': 'modify',
            'key': prevKey,
            'valueChanges': [{
              'type': 'modify',
              'valueChanges': change.valueChanges
            }]
          });
        } else {
          let stack = this.value.get(prevKey);
          if (stack.size() == 1) {
            roundChanges.push({
              'type': 'delete',
              'key': prevKey
            });
          } else {
            roundChanges.push({
              'type': 'modify',
              'key': prevKey,
              'valueChanges': [{
                'type': 'pop'
              }]
            });
          }
          if (!this.value.has(newKey)) {
            roundChanges.push({
              'type': 'set',
              'key': newKey,
              'value': {
                'type': 'stack',
                'items': []
              }
            });
          }
          roundChanges.push({
            'type': 'modify',
            'key': newKey,
            'valueChanges': [
              {'type': 'push', 'value': this.inputStack.last().toDescriptor()},
            ]
          });
        }
      }
      this.value.applyChanges(roundChanges);
      outputChanges.push(...roundChanges);
    }
    return outputChanges;
  }

  _handlePush(value) {
    let changes = [];
    let key = this.f(value);
    if (!this.value.has(key)) {
      changes.push({
        'type': 'set',
        'key': key,
        'value': {
          'type': 'stack',
          'items': []
        }
      });
    }
    changes.push({
      'type': 'modify',
      'key': key,
      'valueChanges': [
        {'type': 'push', 'value': value.toDescriptor()}
      ]
    });
    this.value.applyChanges(changes);
    return changes;
  }

  getValue() {
    return this.value;
  }
}

function groupStackBy(f) {
  return inputValues => new GroupStackBy(inputValues, f);
}
module.exports.groupStackBy = groupStackBy;

// class TransformMapValues {
//   constructor(inputValues, transformation) {
//     this.inputValues = inputValues;
//     this.transformation;
//   }
// }

class Derived {
  constructor(inputs, transformation) {
    this.inputs = inputs;
    let inputValues = inputs.map(input => input.getValue());
    this.transformation = transformation(inputValues);
    this.invalidInputs = 0;
    this.invalidateHandlers = [];
    this.readyHandlers = [];
    this.changes = [];

    inputs.forEach((input, i) => {
      input.onInvalidate(() => {
        this._invalidate();
      });
      input.onReady(change => {
        this.changes[i] = change;
        this._ready();
      });
    });
  }

  getValue() {
    return this.transformation.getValue();
  }

  _invalidate() {
    this.invalidInputs += 1;
    if (this.invalidInputs == 1) {
      this.changes = this.inputs.map(() => []);
      for (let handler of this.invalidateHandlers) {
        handler();
      }
    }
  }

  _ready() {
    this.invalidInputs -= 1;
    if (this.invalidInputs == 0) {
      let changes = this.transformation.applyInputsChanges(this.changes);
      for (let handler of this.readyHandlers) {
        handler(changes);
      }
    }
  }

  onInvalidate(handler) {
    this.invalidateHandlers.push(handler);
  }

  onReady(handler) {
    this.readyHandlers.push(handler);
  }
}

module.exports.apply = function(inputs, transformation) {
  return new Derived(inputs, transformation);
}
