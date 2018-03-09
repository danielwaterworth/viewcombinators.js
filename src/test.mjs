import { Input, RValue, RStack, apply } from "./main.mjs";
import * as view from "./main.mjs";
import { group, driver, entry } from "./driver.mjs";

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
});

group('makeReactive', () => {
  driver('value', console => {
    let value = view.makeReactive({'type': 'value', 'value': 5});
    console.log(value);
    console.log(value.toDescriptor());
  });

  driver('stack', console => {
    let value =
      view.makeReactive({
        'type': 'stack',
        'items': [
          {'type': 'value', 'value': 5},
        ]
      });
    console.log(value);
    console.log(value.toDescriptor());
  });

  driver('map', console => {
    let value =
      view.makeReactive({
        'type': 'map',
        'items': new Map([
          ['foo', {'type': 'value', 'value': 4}],
        ])
      });
    console.log(value);
    console.log(value.toDescriptor());
  });
});

entry();
