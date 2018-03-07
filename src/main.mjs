'use strict';

function last(arr) {
  return arr[arr.length - 1];
}

export class RValue {
  constructor(value) {
    this.value = value;
  }

  applyChanges(changes) {
    this.value = last(changes);
  }

  copy() {
    return new RValue(this.value);
  }
}

export class RStack {
  constructor(value) {
    this.value = value;
  }

  applyChanges(changes) {
    for (let change of changes) {
      if (change.type == 'push') {
        this.value.push(change.value);
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

  copy() {
    return new RStack(this.value.map(x => x.copy()));
  }
}

export class RMap {
  constructor(initialValue) {
    this.value = initialValue;
  }

  applyChanges(changes) {
    for (let change of changes) {
      if (change.type == 'set') {
        this.value.set(change.key, change.value);
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
}

export class RRecord {
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

export class Input {
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

export class MapValue {
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

export function mapValue(f) {
  return inputValues => new MapValue(inputValues, f);
}

export class TransformStackValues {
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
        this.transforms.push(this.transformation([change.value]));
        outputChanges.push({
          'type': 'push',
          'value': last(this.transforms).getValue()
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

export function transformStackValues(transformation) {
  return inputValues => new TransformStackValues(inputValues, transformation);
}

export class FilterStack {
  constructor(inputValues, f) {
    this.inputStack = inputValues[0].copy();
    this.f = f;
    this.results = inputStack.value.map(f);
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
          let outputChange = {'type': 'push', 'value': change.value.copy()};
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
              'value': this.inputStack.last().copy()
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

export function filterStack(f) {
  return inputValues => new FilterStack(inputValues, f);
}

export class StackToMap {
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
      'value': new RValue(value)
    }
    this.value.applyChanges([outputChange]);
    this.inputStack.applyChanges([
      {'type': 'push', 'value': new RValue(record)}
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
        'value': value
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
        this.inputStack.applyChanges([change]);
        let record = this.inputStack.last().value;
        outputChanges.push(this._handlePop());
        outputChanges.push(this._handlePush(record));
      }
    }
    return outputChanges;
  }

  getValue() {
    return this.value;
  }
}

export function stackToMap() {
  return inputValues => new StackToMap(inputValues);
}

export class TransformMapValues {
  constructor(inputValues, transformation) {
    this.inputValues = inputValues;
    this.transformation;
  }
}

// Required Combinators
//
// Stack of Events to current DB
// DB -> View
// View -> DOM

export class Derived {
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

export function apply(inputs, transformation) {
  return new Derived(inputs, transformation);
}
