let { Input, RValue, RStack, apply } = require("../src/main.js");
let view = require("../src/main.js");
let { group, driver, entry, expectException } = require("./driver.js");

require('./make_reactive.js')
require('./rmap.js')

group('mapValue', () => {
  driver('1', console => {
    let value = new Input(new RValue(4));
    let transformed =
      apply([value], view.mapValue(x => x + 1));

    console.log(transformed.getValue());

    value.applyChanges([5]);
    console.log(transformed.getValue());
  });
});

driver('derivedTwice', console => {
  let value = new Input(new RValue(4));
  let transformed1 =
    apply([value], view.mapValue(x => x + 1));
  let transformed2 =
    apply([transformed1], view.mapValue(x => x + 1));

  console.log(transformed2.getValue());

  value.applyChanges([5]);
  console.log(transformed2.getValue());
});

group('stackToMap', () => {
  driver('1', console => {
    let events = new Input(new RStack([]));
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
    let events = new Input(new RStack([]));
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

group('transformStackValues', () => {
  driver('1', console => {
    let events = new Input(new RStack([]));
    events.applyChanges([
      {'type': 'push', 'value': {'type': 'value', 'value': 4}},
      {'type': 'push', 'value': {'type': 'value', 'value': 0}},
    ]);

    let transformed =
      apply([events], view.transformStackValues(view.mapValue(x => x + 1)));

    console.log(transformed.getValue());

    events.applyChanges([
      {'type': 'pop'}
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {
        'type': 'push',
        'value': {'type': 'value', 'value': 2}
      }
    ]);
    console.log(transformed.getValue());

    events.applyChanges([
      {
        'type': 'modify',
        'valueChanges': [4]
      }
    ]);
    console.log(transformed.getValue());
  });
});

group('filterStack', () => {
  driver('1', console => {
    let events = new Input(new RStack([]));
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
    let events = new Input(new RStack([]));
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
    let events = new Input(new RStack([]));
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

entry();
