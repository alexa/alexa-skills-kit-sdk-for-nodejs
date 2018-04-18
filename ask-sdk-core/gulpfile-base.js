'use strict';

const path = require('path');
const child_process = require('child_process');

module.exports = {
    tsc : (done) => {
        const tscPath = path.normalize('./node_modules/typescript/bin/tsc');
        const command = `${tscPath} -p tsconfig.json`;

        child_process.execSync(command, {stdio : 'inherit'});
        done()
    },
    tslint : (done) => {
        const tslintPath = path.normalize('./node_modules/tslint/bin/tslint');
        const command = `${tslintPath} -p tsconfig.json -c tslint.json`;

        child_process.execSync(command, {stdio : 'inherit'});
        done();
    },
    test : (done) => {
        const nycPath = path.normalize('./node_modules/nyc/bin/nyc.js');
        const mochaPath = path.normalize('./node_modules/mocha/bin/_mocha');
        const tsNodePath = path.normalize('./node_modules/ts-node/register/index.js');
        const nycTmpPath = path.join('coverage', './nyc-output');
        const command = `${nycPath} -x tst -e .ts --temp-directory ${nycTmpPath} -r html -r text-summary -r cobertura ` +
            `${mochaPath} --require ${tsNodePath} 'tst/**/*.spec.ts' --reporter nyan`;

        child_process.execSync(command, {stdio : 'inherit'});
        done();
    },
    doc : (done) => {
        const typedocPath = path.normalize('./node_modules/typedoc/bin/typedoc');
        const command = `${typedocPath} --excludeExternals --mode file --out doc lib/`;

        child_process.execSync(command, {stdio : 'inherit'});
        done();
    },
};