'use strict';

const log = require('npmlog');

// 从环境变量中拿到 QL_LOG_LEVEL，从而判断当前的日志级别，支持 debug 模式
log.level = process.env.QL_LOG_LEVEL ? process.env.QL_LOG_LEVEL : 'info';

// 自定义前缀
log.heading = 'Qingluan';

// 添加日志方法
log.addLevel('success', 2000, { fg: 'green', bold: true });

module.exports = log;