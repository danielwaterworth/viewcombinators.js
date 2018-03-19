'use strict';

let { group, driver, expectException } = require("./driver.js");
let { BiSeq } = require('../src/biseq.js')

group('biseq', () => {
  driver('1', console => {
    let s = new BiSeq();
    s.insertAt('foo', 0);

    console.log(s.getPosition('foo'));
  });

  driver('2', console => {
    let s = new BiSeq();
    s.insertAt('foo', 0);
    s.insertAt('bar', 0);

    console.log(s.getPosition('foo'));
    console.log(s.getPosition('bar'));
  });

  driver('3', console => {
    let s = new BiSeq();
    s.insertAt('foo', 0);
    s.insertAt('bar', 1);

    console.log(s.getPosition('foo'));
    console.log(s.getPosition('bar'));
  });
});
