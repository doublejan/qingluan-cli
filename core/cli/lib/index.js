'use strict';

const semver = require('semver');
const colors = require('colors/safe');
const log = require('@qingluan/log');
const pkg = require('../package.json');
const userHome = require('user-home');
const { existsSync } = require('./path-exits');
const constants = require('../lib/constants');

function cli() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (e) {
    log.error(e.message);
  }
}

// 检查版本
function checkPkgVersion() {
  log.info('version', pkg.version);
  return pkg.version;
}

// 检查 node 版本号
function checkNodeVersion() {
  // 1. 获取当前 node 版本号
  // 2. 和定义的最低版本号做比对
  const currentVersion = process.version;
  const lowestVersion = constants.LOWEST_NODE_VERSION;
  log.info('checkNodeVersion', `${currentVersion} : ${lowestVersion}`);
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`qingluan-cli 需要安装 ${lowestVersion} 以上版本的 Node.js`));
  }
}

// 检查 root 账户启动
async function checkRoot() {
  const rootCheck = await import('root-check');
  rootCheck.default();
}

// 检查用户主目录
function checkUserHome() {
  log.info('[HOME]', userHome);
  if (!userHome || !existsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在'));
  }
}

module.exports = cli;
