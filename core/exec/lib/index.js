'use strict';

const path = require('path');
const cp = require('child_process');
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
  console.log('rootFile', rootFile);
  if (rootFile) {
    // require(rootFile)(args);
    const obj = Object.keys(command).reduce((acc, key) => {
      if (command.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
        acc[key] = command[key];
      }
      return acc;
    }, {});
    console.log('obj', obj);
    args[args.length - 1] = obj;
    console.log('args', args);
    const code = '';
    const child = spawn(
      'node',
      ['-e', `require('${rootFile}')(${JSON.stringify(args)})`],
      { cwd: process.cwd(), stdio: 'inherit' }
    );
    child.on('error', e => {
      console.error('e', e);
      process.exit(1);
    });
    child.on('exit', e => {
      console.log('命令执行成功：', e);
      process.exit(e);
    });
  } else {
    console.log('not found rootFile');
  }
}

function spawn(command, args, options) {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'cmd' : command;
  const cmdArgs = isWindows ? ['/c'].concat(command, args) : args;
  return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;
