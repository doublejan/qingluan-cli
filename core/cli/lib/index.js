'use strict';

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const log = require('@qingluan/log');
const pkg = require('../package.json');
const userHome = require('user-home');
const minimist = require('minimist');
const { existsSync : pathExits } = require('./path-exits');
const constants = require('../lib/constants');
const { getNpmSemverVersion } = require('@qingluan/get-npm-info');
const dedent = require('dedent');

// 解析后的入参对象
let args = {};
// 环境变量对象
let config = {};

function cli() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
    checkGlobalUpdate();
  } catch (e) {
    log.error(e.message);
  }
}

// 检查版本
function checkPkgVersion() {
  log.verbose('version', pkg.version);
  return pkg.version;
}

// 检查 node 版本号
function checkNodeVersion() {
  // 1. 获取当前 node 版本号
  // 2. 和定义的最低版本号做比对
  const currentVersion = process.version;
  const lowestVersion = constants.LOWEST_NODE_VERSION;
  log.verbose('checkNodeVersion', `${currentVersion} : ${lowestVersion}`);
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
  log.verbose('[HOME]', userHome);
  if (!userHome || !pathExits(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在'));
  }
}

// 检查入参，识别 debug 模式，重置 log level
function checkInputArgs() {
  args = minimist(process.argv.slice(2));
  log.verbose('args', args);
  checkDebugMode(args);
}

// 检查并应用 debug 模式
function checkDebugMode(args) {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  // 由于 log 是在上面就已经 require 了，只改 process.env 无法生效
  // 必须将结果修改到 log 上
  log.level = process.env.LOG_LEVEL;
}

// 检查环境变量
function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExits(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
    log.verbose('[DEBUG] env', process.env.CLI_HOME);
  } else {
    log.verbose('env not found');
  }
  config = createDefaultConfig();
}

// 创建默认环境变量
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, constants.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  log.verbose('[CLI_CONFIG]', process.env.CLI_HOME_PATH, cliConfig);
  return cliConfig;
}

// 检查是否需要全局更新
async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名（可以从 package.json）获取
  // 2. 调用 npm API，获取所有版本号
  // 3. 提取所有版本号，一一比较版本大小
  // 4. 获取最新的版本号，提示用户更新到该版本
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  log.verbose('[PACKAGE_INFO]', 'name', npmName, 'lastVersion', lastVersion, 'currentVersion', currentVersion);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(dedent`
      请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
    `));
    log.warn(colors.yellow(dedent`更新命令：npm install -g ${npmName}`));
  }
}

module.exports = cli;
