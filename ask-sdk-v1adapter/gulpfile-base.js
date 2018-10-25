'use strict';

const path = require('path');
const child_process = require('child_process');

module.exports = {
  tsc : (done) => {
    const tscPath = path.normalize('./node_modules/.bin/tsc');
    const command = `${tscPath} -p tsconfig.json`;

    exec(command, done);
  },
  tslint : (done) => {
    const tslintPath = path.normalize('./node_modules/.bin/tslint');
    const command = `${tslintPath} -p tsconfig.json -c tslint.json`;

    exec(command, done);
  },
  test : (done) => {
    const nycPath = path.normalize('./node_modules/.bin/nyc');
    const mochaPath = path.normalize('./node_modules/.bin/_mocha');
    const tsNodePath = path.normalize('./node_modules/ts-node/register/index.js');
    const nycTmpPath = path.join('coverage', './nyc-output');
    const command = `${nycPath} -x tst -e .ts --temp-dir ${nycTmpPath} -r html -r text-summary -r cobertura ` +
        `${mochaPath} --require ${tsNodePath} 'tst/**/*.spec.ts' --reporter min`;

    exec(command, done);
  },
};

function exec(command, callback) {
  child_process.exec(command, function(err, stdout, stderr) {
    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.log(stderr);
    }

    callback(err);
  });
}