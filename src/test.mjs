import { Input, RValue, RStack, apply } from "./main.mjs";
import * as view from "./main.mjs";
import { group, driver, entry } from "./driver.mjs";

driver('stackToMap#1', console => {
  let events = new Input(new RStack([]));
  events.applyChanges([{'type': 'push', 'value': new RValue(['foo', 'bar'])}]);

  let transformed =
    apply([events], view.stackToMap());

  console.log(transformed.getValue());
  events.applyChanges([{'type': 'push', 'value': new RValue(['foo', 'baz'])}]);
  console.log(transformed.getValue());
  events.applyChanges([{'type': 'push', 'value': new RValue(['bar', 'baz'])}]);
  console.log(transformed.getValue());
});

group('makeReactive', () => {
  driver('value', console => {
    let value = view.makeReactive({'type': 'value', 'value': 5});
    console.log(value);
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
  });
});

entry();
