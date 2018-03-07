import { Input, RStack, RValue, apply, stackToMap } from "./main.mjs";
import { driver, entry } from "./driver.mjs";

driver('', () => {
  let events = new Input(new RStack([]));
  events.applyChanges([{'type': 'push', 'value': new RValue(['foo', 'bar'])}]);

  let transformed =
    apply([events], stackToMap());

  console.log(transformed.getValue());
  events.applyChanges([{'type': 'push', 'value': new RValue(['foo', 'baz'])}]);
  console.log(transformed.getValue());
  events.applyChanges([{'type': 'pop'}]);
  console.log(transformed.getValue());
  events.applyChanges([{'type': 'modify', 'valueChanges': [['foo', 'bob']]}]);
  console.log(transformed.getValue());
});

driver('', () => {
});

entry();
