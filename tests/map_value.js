let { Input, makeReactive, apply } = require("../src/main.js");
let view = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");

group('mapValue', () => {
  driver('1', console => {
    let value =
      new Input(
        makeReactive({
          'type': 'value',
          'value': 4
        })
      );

    let transformed =
      apply([value], view.mapValue(x => x + 1));

    console.log(transformed.getValue());

    value.applyChanges([5]);
    console.log(transformed.getValue());
  });
});
