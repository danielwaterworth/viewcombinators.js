let { Input, makeReactive, apply } = require("../src/main.js");
let view = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");

group('filterStack', () => {
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
      apply([events], view.filterStack(x => x.value > 2));

    console.log(transformed.getValue());

    events.applyChanges([
      {'type': 'pop'},
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {'type': 'pop'},
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': 5}},
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
      {'type': 'push', 'value': {'type': 'value', 'value': 4}},
      {'type': 'push', 'value': {'type': 'value', 'value': 0}},
    ]);

    let transformed =
      apply([events], view.filterStack(x => x.value > 2));

    console.log(transformed.getValue());

    events.applyChanges([
      {
        'type': 'modify',
        'valueChanges': [3]
      },
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {
        'type': 'modify',
        'valueChanges': [1]
      },
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {
        'type': 'pop'
      },
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {
        'type': 'pop'
      },
    ]);
    console.log(transformed.getValue());
  });

  driver('3', console => {
    let events =
      new Input(
        makeReactive({
          'type': 'stack',
          'items': []
        })
      );

    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': 4}},
    ]);

    let transformed =
      apply([events], view.filterStack(x => x.value > 2));

    console.log(transformed.getValue());

    events.applyChanges([
      {
        'type': 'modify',
        'valueChanges': [3]
      },
    ]);
    console.log(transformed.getValue());
  });
});
