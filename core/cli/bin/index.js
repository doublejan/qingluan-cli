#! /usr/bin/env node

const importLocal = require('import-local');
const log = require('@qingluan/log');

if (importLocal(__filename)) {
  log.info('cli', 'using qingluan-cli local version');
} else {
  require('../lib')(process.argv.slice(2));
}


// const commander = require('commander');
// const pkg = require('../package.json');

// const program = new commander.Command();

// program
//   .name('qingluan')
//   .usage('<command> [options]')
//   .version(pkg.version)
//   .option('-d, --debug', 'enable debug mode')
//   .option('-e, --env <env>', 'set env');
 

// const clone = program.command('clone <source> [target]');
// clone
//   .description('clone a repository')
//   .option('-f, --force', '是否强制克隆')
//   .action((source, target, command) => {
//     console.log('do clone', source, target, command.force);
//   });

// const service = new commander.Command('service');
// program.addCommand(service);

// service
//   .command('start [port]')
//   .description('start service at some port')
//   .action((port) => {
//     console.log('do service start', port);
//   });

// service
//   .command('stop')
//   .description('stop service')
//   .action(() => {
//     console.log('do service stop');
//   });

// program
//   .arguments('<cmd> [options]')
//   .description('test command', {
//     cmd: 'command to run',
//     options: 'options for command',
//   })
//   .action((cmd, options) => {
//     console.log(cmd, options);
//   });

// program
//   .command('install [name]', 'install-package', {
//     executableFile: 'ql-cli-install',
//     isDefault: true,
//     hidden: true,
//   })
//   .alias('i')

// program.helpInformation = () => {
//   return '';
// }

// program.on('option:debug', () => {
//   // 走到这里说明 debug 一定是 true，这里判断只是保险起见
//   if (program.opts().debug) {
//     process.env.LOG_LEVEL = 'verbose';
//   }
//   console.log('enable debug mode', program.opts(), process.env.LOG_LEVEL);
// })

// program.on('command:*', (args) => {
//   console.error('未知命令: ', args[0]);
//   const availableCommands = program.commands.map(cmd => cmd.name());
//   console.log('可选命令: ', availableCommands.join(', '));
// })

// program.parse(process.argv);

