'use strict';

const log = require('@qingluan/log');
const pkg = require('../package.json');

function cli() {
  checkPkgVersion();
}

function checkPkgVersion() {
  log.info('version', pkg.version);
  return pkg.version;
}

module.exports = cli;
