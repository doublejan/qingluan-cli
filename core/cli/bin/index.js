#! /usr/bin/env node

const importLocal = require('import-local');
const log = require('@qingluan/log');

if (importLocal(__filename)) {
  log.info('cli', 'using qingluan-cli local version');
} else {
  require('../lib')(process.argv.slice(2));
}
