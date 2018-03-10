let { Input, makeReactive, apply } = require("../src/main.js");
let view = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");

driver('derivedTwice', console => {
  let value =
    new Input(
      makeReactive({
        'type': 'value',
        'value': 4
      })
    );
  let transformed1 =
    apply([value], view.mapValue(x => x + 1));
  let transformed2 =
    apply([transformed1], view.mapValue(x => x + 1));

  console.log(transformed2.getValue());

  value.applyChanges([5]);
  console.log(transformed2.getValue());
});
