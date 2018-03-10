let { Input, makeReactive, apply } = require("../src/main.js");
let view = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");

group('stackToMap', () => {
  driver('1', console => {
    let events =
      new Input(
        makeReactive({
          'type': 'stack',
          'items': []
        })
      );

    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': ['foo', 'bar']}}
    ]);

    let transformed =
      apply([events], view.stackToMap());

    console.log(transformed.getValue());
    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': ['foo', 'baz']}}
    ]);
    console.log(transformed.getValue());
    events.applyChanges([
      {'type': 'pop'}
    ]);
    console.log(transformed.getValue());
  });

  driver('2', console => {
    let events =
      new Input(
        makeReactive({
          'type': 'stack',
          'items': []
        })
      );

    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': ['foo', 'bar']}}
    ]);

    let transformed =
      apply([events], view.stackToMap());

    events.applyChanges([
      {
        'type': 'modify',
        'valueChanges': [['fuss', 'bob']]
      }
    ]);

    console.log(transformed.getValue());
  });
});
