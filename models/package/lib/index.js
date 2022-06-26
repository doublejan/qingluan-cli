'use strict';

const path = require('path');
const fse = require('fs-extra');
const npmInstall = require('npminstall');
const { getDefaultRegistry, getNpmLatestVersion } = require('@qingluan/get-npm-info')
const formatPath = require('@qingluan/format-path');
const { isObject } = require('@qingluan/utils');
const { existsSync } = require('./path-exits');

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package 类的 options 参数不能为空');
    }
    if (!isObject(options)) {
      throw new Error('Package 类的 options 参数必须为对象');
    }

    // package 的路径
    this.targetPath = options.targetPath;
    // package 的存储路径（从远程仓库下载下来后，本地的安装目录）
    this.storeDir = options.storeDir;
    // package 的 name
    this.packageName = options.packageName;
    // package 的 version
    this.packageVersion = options.packageVersion;
    // package 的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  getSpecificVersionCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
  }

  async prepare() {
    console.log('prepare 路径是否不完整：', this.storeDir && !existsSync(this.storeDir))
    if (this.storeDir && !existsSync(this.storeDir)) {
      console.log('开始创建路径');
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
    console.log('packageVersion', this.packageName, this.packageVersion);
  }

  // 判断 package 是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      console.log('cacheFilePath', this.cacheFilePath);
      return existsSync(this.cacheFilePath);
    } else {
      return existsSync(this.targetPath);
    }
  }

  // 安装 package
  async install() {
    await this.prepare();
    return npmInstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion },
      ],
    });
  }

  // 更新 package
  async update() {
    this.prepare();
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    const latestFilePath = this.getSpecificVersionCacheFilePath(latestPackageVersion);
    if (!existsSync(latestFilePath)) {
      console.log('不存在', latestPackageVersion, latestFilePath);
      await npmInstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          { name: this.packageName, version: latestPackageVersion },
        ],
      });
      this.packageVersion = latestPackageVersion;
      console.log('更新完成，当前版本：', this.packageVersion);
    } else {
      console.log('已存在', latestPackageVersion, latestFilePath)
    }
  }

  // 获取入口文件路径
  async getRootFilePath() {
    const _getRootFilePath = async (filePath) => {
      // 1. 获取 package.json 文件路径
      const pkgDir = await import('pkg-dir');
      const dir = pkgDir.packageDirectorySync({ cwd: filePath });

      if (dir) {
        // 2. 读取 package.json
        const pkgFile = require(path.resolve(dir, 'package.json'));

        // 3. 寻找入口文件
        if (pkgFile?.main) {

          // 4. 路径兼容平台差异（windows上的分割符为反斜杠，需要改为斜杠）
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
    }
    if (this.storeDir) {
      console.log('getRootFilePath storeDir 存在', this.cacheFilePath);
      const rootPath = await _getRootFilePath(this.cacheFilePath);
      console.log('rootPath', rootPath);
      return rootPath;
    } else {
      console.log('getRootFilePath storeDir 不存在', this.storeDir);
      return await _getRootFilePath(this.targetPath);
    }
  }
}

module.exports = Package;
