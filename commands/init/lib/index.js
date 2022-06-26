'use strict';

const Command = require('@qingluan/command');

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || '';
    this.force = this._argv[1]?.force;
    console.log('init project-name', this.projectName);
    console.log('init config', this.force, this._argv);
  }
  exec() {

  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports.InitCommand = InitCommand;
module.exports = init
