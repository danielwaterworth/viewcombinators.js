import errorStackParser from 'error-stack-parser';

let points = new Map();

function insertPoint(key, value) {
  if (points.has(key)) {
    points.set(key, () => { console.error('ambiguous'); });
  } else {
    points.set(key, value);
  }
}

function last(x) {
  return x[x.length - 1];
}

function callerFileAndLineNumber() {
  let trace = errorStackParser.parse(new Error());
  return [trace[2].fileName, trace[2].lineNumber];
}

export function driver(name, f) {
  let [file, line] = callerFileAndLineNumber();
  insertPoint(line.toString(), f);
  insertPoint(file, f);
  insertPoint(file + ':' + line, f);
  let fileName = last(file.split('/'));
  insertPoint(fileName, f);
  insertPoint(fileName + ':' + line, f);
  insertPoint(name, f);
}

export function entry() {
  let key = last(process.argv);
  if (points.has(key)) {
    points.get(last(process.argv))();
  } else {
    console.error('no such driver');
  }
}

