'use strict';

const path = require('path');

function formatPath(p) {
  if (p) {
    // path.sep 上就是该平台使用的路径分隔符
    const sep = path.sep;
    if (sep === '/' && typeof p === 'string') {
      return p;
    } else {
      return p.replace(/\\/g, '/');
    }
  }
  return p;
}

module.exports = formatPath;
