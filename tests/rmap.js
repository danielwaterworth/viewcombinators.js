let view = require("../src/main.js");
let { group, driver, expectException } = require("./driver.js");

group('RMap', () => {
  driver('copy', console => {
    let m =
      view.makeReactive({
        'type': 'map',
        'items': new Map([
          ['foo', {
            'type': 'value',
            'value': 4
          }]
        ])
      });
    let m2 = m.copy();
    m.applyChanges([
      {
        'type': 'set',
        'key': 'foo',
        'value': {
          'type': 'value',
          'value': 5
        }
      }
    ]);
    console.log(m.copy());
    console.log(m2.copy());
  });

  driver('delete', console => {
    let m =
      view.makeReactive({
        'type': 'map',
        'items': new Map([
          ['foo', {
            'type': 'value',
            'value': 4
          }]
        ])
      });
    m.applyChanges([
      {
        'type': 'delete',
        'key': 'foo'
      }
    ]);
    console.log(m);
  });

  driver('modify', console => {
    let m =
      view.makeReactive({
        'type': 'map',
        'items': new Map([
          ['foo', {
            'type': 'value',
            'value': 4
          }]
        ])
      });
    m.applyChanges([
      {
        'type': 'modify',
        'key': 'foo',
        'valueChanges': [5]
      }
    ]);
    console.log(m);
  });
});
