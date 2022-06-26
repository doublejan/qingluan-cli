'use strict';

const path = require('path');
const Package = require('@qingluan/package');
const log = require('@qingluan/log');

const SETTING = {
  init: '@qingluan/init',
  // init : 'dayjs',
}

const CACHE_DIR = 'dependencies';


async function exec(...args) {
  const command = args.slice(-1)[0];
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg;

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, 'node_modules');

    console.log(process.env.LOG_LEVEL, targetPath, storeDir);

    pkg = new Package({
      packageName: SETTING[command.name()],
      packageVersion: 'latest',
      targetPath,
      storeDir,
    });
    if (await pkg.exists()) {
      // 如果存在，更新 package
      console.log('package 存在，接下来检查更新');
      await pkg.update();
    } else {
      // 不存在，走安装 package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      packageName: SETTING[command.name()],
      packageVersion: 'latest',
      targetPath,
      storeDir,
    });
  }

  const rootFile = await pkg.getRootFilePath();
  if (rootFile) {
    require(rootFile)(...args);
  } else {
    console.log('not found rootFile');
  }
}

module.exports = exec;
