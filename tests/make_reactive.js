let view = require("../src/main.js");
let { group, driver, entry, expectException } = require("./driver.js");

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

  driver('invalid', console => {
    let e =
      expectException(() => {
        view.makeReactive({});
      });
    console.log(e.message);
  });
});
