'use strict';

let { group, driver, expectException } = require("./driver.js");
let { Seq } = require('../src/seq.js')

group('seq', () => {
  driver('empty', console => {
    let v = Seq.empty();
    console.log(v);
    console.log(v.size);
    console.log(v.depth);
  });

  driver('singleton', console => {
    let v = Seq.singleton(1);
    console.log(v);
    console.log(v.size);
    console.log(v.depth);
  });

  group('join', () => {
    driver('1', console => {
      let x = Seq.singleton(1);
      let y = Seq.singleton(2);
      let v = Seq.join(x, y);
      console.log(v);
      console.log(v.size);
      console.log(v.depth);
    });

    driver('2', console => {
      let x = Seq.singleton(1);
      let y = Seq.singleton(2);
      let z = Seq.singleton(3);
      let v = Seq.join(x, y);
      let v2 = Seq.join(v, z);
      console.log(v2);
      console.log(v2.size);
      console.log(v2.depth);
    });

    driver('3', console => {
      let x = Seq.singleton(1);
      let y = Seq.singleton(2);
      let z = Seq.singleton(3);
      let v = Seq.join(y, z);
      let v2 = Seq.join(x, v);
      console.log(v2);
      console.log(v2.size);
      console.log(v2.depth);
    });

    driver('4', console => {
      let w = Seq.singleton(1);
      let x = Seq.singleton(2);
      let y = Seq.singleton(3);
      let z = Seq.singleton(4);
      let v = Seq.join(w, x);
      let v2 = Seq.join(v, y);
      let v3 = Seq.join(v2, z);
      console.log(v3);
      console.log(v3.size);
      console.log(v3.depth);
    });

    driver('4a', console => {
      let w = Seq.singleton(1);
      let x = Seq.singleton(2);
      let y = Seq.singleton(3);
      let z = Seq.singleton(4);
      let v = Seq.join(y, z);
      let v2 = Seq.join(x, v);
      let v3 = Seq.join(w, v2);
      console.log(v3);
      console.log(v3.size);
      console.log(v3.depth);
    });

    driver('5', console => {
      let v = Seq.singleton(1);
      let w = Seq.singleton(2);
      let x = Seq.singleton(3);
      let y = Seq.singleton(4);
      let z = Seq.singleton(5);
      let v1 = Seq.join(v, w);
      let v2 = Seq.join(v1, x);
      let v3 = Seq.join(v2, y);
      let v4 = Seq.join(v3, z);
      console.log(v4);
      console.log(v4.size);
      console.log(v4.depth);
    });

    group('join-identity', () => {
      driver('left', console => {
        let v = Seq.singleton(1);
        let e = Seq.empty();
        let out = Seq.join(e, v);
        console.log(out);
      });

      driver('right', console => {
        let v = Seq.singleton(1);
        let e = Seq.empty();
        let out = Seq.join(v, e);
        console.log(out);
      });
    });
  });

  group('fromList', () => {
    driver('1', console => {
      let x = Seq.fromList([]);
      console.log(x);
    });

    driver('2', console => {
      let x = Seq.fromList([1]);
      console.log(x);
    });

    driver('3', console => {
      let x = Seq.fromList([1, 2]);
      console.log(x);
    });

    driver('4', console => {
      let x = Seq.fromList([1, 2, 3]);
      console.log(x);
    });

    driver('5', console => {
      let x = Seq.fromList([1, 2, 3, 4]);
      console.log(x);
    });

    driver('6', console => {
      let x = Seq.fromList([1, 2, 3, 4, 5]);
      console.log(x);
    });

    driver('7', console => {
      let x = Seq.fromList([1, 2, 3, 4, 5, 6]);
      console.log(x);
    });
  });

  group('take', () => {
    group('zero-items', () => {
      driver('1', console => {
        let v = Seq.fromList([]);
        console.log(v.take(0));
      });

      driver('2', console => {
        let v = Seq.fromList([]);
        let e =
          expectException(() => {
            v.take(1);
          });
        console.log(e.name + ': ' + e.message);
      });
    });

    group('singleton', () => {
      driver('1', console => {
        let v = Seq.fromList([1]);
        console.log(v.take(0));
      });

      driver('2', console => {
        let v = Seq.fromList([1]);
        console.log(v.take(1));
      });

      driver('3', console => {
        let v = Seq.fromList([1]);
        let e =
          expectException(() => {
            v.take(2);
          });
        console.log(e.name + ': ' + e.message);
      });
    });

    group('two-items', () => {
      driver('1', console => {
        let v = Seq.fromList([1, 2]);
        console.log(v.take(0));
      });

      driver('2', console => {
        let v = Seq.fromList([1, 2]);
        console.log(v.take(1));
      });

      driver('3', console => {
        let v = Seq.fromList([1, 2]);
        console.log(v.take(2));
      });

      driver('4', console => {
        let v = Seq.fromList([1, 2]);
        let e =
          expectException(() => {
            v.take(3);
          });
        console.log(e.name + ': ' + e.message);
      });
    });

    group('three-items', () => {
      driver('1', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.take(0));
      });

      driver('2', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.take(1));
      });

      driver('3', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.take(2));
      });

      driver('4', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.take(3));
      });

      driver('5', console => {
        let v = Seq.fromList([1, 2, 3]);
        let e =
          expectException(() => {
            v.take(4);
          });
        console.log(e.name + ': ' + e.message);
      });
    });
  });

  group('drop', () => {
    group('zero-items', () => {
      driver('1', console => {
        let v = Seq.fromList([]);
        console.log(v.drop(0));
      });

      driver('2', console => {
        let v = Seq.fromList([]);
        let e =
          expectException(() => {
            v.drop(1);
          });
        console.log(e.name + ': ' + e.message);
      });
    });

    group('singleton', () => {
      driver('1', console => {
        let v = Seq.fromList([1]);
        console.log(v.drop(0));
      });

      driver('2', console => {
        let v = Seq.fromList([1]);
        console.log(v.drop(1));
      });

      driver('3', console => {
        let v = Seq.fromList([1]);
        let e =
          expectException(() => {
            v.drop(2);
          });
        console.log(e.name + ': ' + e.message);
      });
    });

    group('two-items', () => {
      driver('1', console => {
        let v = Seq.fromList([1, 2]);
        console.log(v.drop(0));
      });

      driver('2', console => {
        let v = Seq.fromList([1, 2]);
        console.log(v.drop(1));
      });

      driver('3', console => {
        let v = Seq.fromList([1, 2]);
        console.log(v.drop(2));
      });

      driver('4', console => {
        let v = Seq.fromList([1, 2]);
        let e =
          expectException(() => {
            v.drop(3);
          });
        console.log(e.name + ': ' + e.message);
      });
    });

    group('three-items', () => {
      driver('1', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.drop(0));
      });

      driver('2', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.drop(1));
      });

      driver('3', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.drop(2));
      });

      driver('4', console => {
        let v = Seq.fromList([1, 2, 3]);
        console.log(v.drop(3));
      });

      driver('5', console => {
        let v = Seq.fromList([1, 2, 3]);
        let e =
          expectException(() => {
            v.drop(4);
          });
        console.log(e.name + ': ' + e.message);
      });
    });
  });

  group('insertAt', () => {
    driver('1', console => {
      let v = Seq.fromList([]);
      console.log(v.insertAt(0, 1));
    });

    driver('2', console => {
      let v = Seq.fromList([1]);
      console.log(v.insertAt(1, 2));
    });

    driver('3', console => {
      let v = Seq.fromList([2]);
      console.log(v.insertAt(0, 1));
    });
  });

  group('toList', () => {
    driver('1', console => {
      console.log(Seq.fromList([]).toList());
    });

    driver('2', console => {
      console.log(Seq.fromList([1]).toList());
    });

    driver('3', console => {
      console.log(Seq.fromList([1, 2]).toList());
    });

    driver('4', console => {
      console.log(Seq.fromList([1, 2, 3]).toList());
    });
  });

  group('head', () => {
    driver('1', console => {
      let e =
        expectException(() => {
          Seq.fromList([]).head();
        });
      console.log(e.name + ': ' + e.message);
    });

    driver('2', console => {
      console.log(Seq.fromList([1]).head());
    });

    driver('3', console => {
      console.log(Seq.fromList([1, 2]).head());
    });

    driver('4', console => {
      console.log(Seq.fromList([1, 2, 3]).head());
    });
  });

  group('get', () => {
    driver('1', console => {
      let e =
        expectException(() => {
          Seq.empty().get(0);
        });
      console.log(e.name + ': ' + e.message);
    });

    driver('2', console => {
      console.log(Seq.fromList([1]).get(0));
    });

    driver('3', console => {
      let e =
        expectException(() => {
          Seq.fromList([1]).get(1);
        });
      console.log(e.name + ': ' + e.message);
    });
  });
});
