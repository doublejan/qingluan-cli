'use strict';

function init(projectName, options, command) {
  console.log('init', projectName, options, process.env.CLI_TARGET_PATH);
  return `${projectName} has initialized successfully`;
}

module.exports = init;
