'use strict';

const semver = require('semver');
const colors = require('colors/safe');

const { isObject } = require('@qingluan/utils');
const log = require('@qingluan/log');

const LOWEST_NODE_VERSION = 'v13.0.0';     // 最低 node 版本号

class Command {

  constructor(argv) {
    // console.log('Command constructor', argv);
    if (!Array.isArray(argv)) {
      throw new Error('Command 参数必须为数组');
    }
    if (argv.length < 1) {
      throw new Error('Command 参数列表不能为空');
    }
    this._argv = argv;
    this.runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch(err => {
        console.log('Command chain err', err);
      })
    });
  }

  init() {
    throw new Error('Command init 必须被实现');
  }

  exec() {
    throw new Error('Command exec 必须被实现');
  }

  initArgs() {
    this._cmd = this._argv.slice(-1)[0];
    this._argv = this._argv.slice(0, -1);
    console.log(this._cmd, this._argv);
  }

  // 检查 node 版本号
  checkNodeVersion() {
    // 1. 获取当前 node 版本号
    // 2. 和定义的最低版本号做比对
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    log.verbose('checkNodeVersion', `${currentVersion} : ${lowestVersion}`);
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(colors.red(`qingluan-cli 需要安装 ${lowestVersion} 以上版本的 Node.js`));
    }
    console.log('Command checkNodeVersion', semver.gte(currentVersion, lowestVersion), currentVersion, lowestVersion);
  }
}


module.exports = Command;
