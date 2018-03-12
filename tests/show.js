'use strict';

let { Input, makeReactive, apply } = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");
let show = require("../src/show.js");

group('show', () => {
  group("value", () => {
    driver("short", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'value',
          'value': 5
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("long", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'value',
          'value': 'na '.repeat(20) + 'batman!'
        });
      output.show(val);
      console.log(output.finish());
    });
  });

  group("stack", () => {
    driver("zero_items", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'stack',
          'items': [
          ]
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("one_item", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'stack',
          'items': [
            {'type': 'value', 'value': 4}
          ]
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("two_items", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'stack',
          'items': [
            {'type': 'value', 'value': 4},
            {'type': 'value', 'value': 5}
          ]
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("many_items", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'stack',
          'items': [
            {'type': 'value', 'value': 4},
            {'type': 'value', 'value': 5},
            {'type': 'value', 'value': 6}
          ]
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("most_items", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'stack',
          'items': [
            {'type': 'value', 'value': 4},
            {'type': 'value', 'value': 5},
            {'type': 'value', 'value': 6},
            {'type': 'value', 'value': 7},
            {'type': 'value', 'value': 8}
          ]
        });
      output.show(val);
      console.log(output.finish());
    });
  });

  group("map", () => {
    driver("zero_items", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'map',
          'items': [
          ]
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("one_item", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'map',
          'items': new Map([
            ['foo', {'type': 'value', 'value': 4}]
          ])
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("two_items", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'map',
          'items': new Map([
            ['foo', {'type': 'value', 'value': 4}],
            ['bar', {'type': 'value', 'value': 5}]
          ])
        });
      output.show(val);
      console.log(output.finish());
    });

    driver("many_items", console => {
      let output = new show.Output();
      let val =
        makeReactive({
          'type': 'map',
          'items': new Map([
            ['foo', {'type': 'value', 'value': 4}],
            ['bar', {'type': 'value', 'value': 5}],
            ['baz', {'type': 'value', 'value': 6}]
          ])
        });
      output.show(val);
      console.log(output.finish());
    });
  });
});
