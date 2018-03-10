let { Input, makeReactive, apply } = require("../src/main.js");
let view = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");

group('mapStackValues', () => {
  driver('1', console => {
    let events =
      new Input(
        makeReactive({
          'type': 'stack',
          'items': []
        })
      );

    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': 4}},
      {'type': 'push', 'value': {'type': 'value', 'value': 0}},
    ]);

    let transformed =
      apply([events], view.mapStackValues(x => makeReactive({
        'type': 'value',
        'value': x.value + 1
      })));

    console.log(transformed.getValue());

    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': 2}},
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {'type': 'pop'},
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {'type': 'modify', 'valueChanges': [6]},
    ]);
    console.log(transformed.getValue());
  });
});
