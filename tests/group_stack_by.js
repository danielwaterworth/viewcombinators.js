'use strict';

let { Input, makeReactive, apply } = require("../src/main.js");
let view = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");

group('groupStackBy', () => {
  driver('1', console => {
    // let events =
    //   new Input(
    //     makeReactive({
    //       'type': 'stack',
    //       'items': []
    //     })
    //   );

    // events.applyChanges([
    //   {
    //     'type': 'push',
    //     'value': {'type': 'value', 'value': record('foo', 1)}
    //   },
    //   {
    //     'type': 'push',
    //     'value': {'type': 'value', 'value': record('foo', 2)}
    //   },
    //   {
    //     'type': 'push',
    //     'value': {'type': 'value', 'value': record('bar', 3)}
    //   },
    // ]);

    // let transformed =
    //   apply([events], view.groupStackBy(x => x.value.key));

    // console.log(transformed.getValue().value);

    // events.applyChanges([{
    //   'type': 'push',
    //   'value': {'type': 'value', 'value': record('bar', 4)}
    // }]);
    // console.log(transformed.getValue().value);
  });
});
