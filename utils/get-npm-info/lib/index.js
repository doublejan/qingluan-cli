'use strict';
const axios = require('axios');
const semver = require('semver');


async function getNpmInfo(npmName, registry) {
  const urlJoin = (await import('url-join')).default;
  if (!npmName) {
    return null;
  }
  const registryUrl = registry ? registry : getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  try {
    const resp = await axios.get(npmInfoUrl);
    if (resp.status === 200) {
      return resp.data;
    } else {
      return null;
    }
  } catch (e) {
    console.error('[NETWORK_ERR] ', e);
    Promise.reject(e);
  }
}

function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org/'
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  }
  return [];
}

function getSemverVersion(baseVersion, versions) {
  // 首先按照 ^<version> 的写法从所有版本号中过滤出 大于等于 baseVersion 的所有版本号
  // 之后为了健壮性，还需要对其按照大小（新旧）排序，越新的版本越靠前
  return versions
    .filter(version => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getSemverVersion(baseVersion, versions);
  if (Array.isArray(newVersions) && newVersions.length > 0) {
    return newVersions[0];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getDefaultRegistry,
  getNpmVersions,
  getNpmSemverVersion,
};
