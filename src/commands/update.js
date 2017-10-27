const path = require('path');
const fs = require('fs-extra');
const download = require('download');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');
const _ = require('underscore');

var root, config;

const wget = utils.wget;
const fileExist = utils.fileExist;

async function run(argv) {
  root = process.cwd();
  let configFilepath = path.resolve(root, 'config.json');
  if (!fileExist(configFilepath)) {
    throw new Error('项目目录找不到配置文件 config.json ');
  }
  if (!shell.which('node') || !shell.which('npm')) {
    throw new Error('需要配置 node 和 npm 环境');
  }
  let nodeVersion = shell.exec('node -v', {silent: true}).substr(1);

  if(!utils.compareVersion('7.6', nodeVersion)){
    throw new Error('node 需要 7.6 或以上版本')
  }


  let v = argv.v;
  v = v ? 'v' + utils.handleVersion(v) : null;
  let hasPlugin = false;

  let versions = await axios.get('http://yapi.demo.qunar.com/publicapi/versions');
  if (!v || typeof v !== 'string') {
    v = 'v' + versions.data[0].version;
  }else if (!_.find(versions.data, item => {
    return ('v' + item.version) === v
  })) {
    throw new Error('不存在的版本号，请执行 yapi ls 查看版本号列表');
  }
  console.log('更新版本为' + v);
  let config = require(configFilepath);
  let npmInstall = 'npm install --production --registry https://registry.npm.taobao.org';
  if (config.plugins && Array.isArray(config.plugins) && config.plugins.length > 0) {
    hasPlugin = true;
    npmInstall = 'npm install --registry https://registry.npm.taobao.org';
  }

  let yapiPath = path.resolve(root, 'vendors');
  utils.log('开始下载平台文件压缩包...')
  await wget(yapiPath, v);
  utils.log('部署文件完成，正在执行 npm install...')
  shell.cd(yapiPath);

  shell.exec(npmInstall);
  if (hasPlugin) {
    config.plugins.forEach(item => {
      if (!item) {
        return null;
      }
      if (typeof item === 'string') {
        shell.exec('npm install ' + 'yapi-plugin-' + item)
      } else if (typeof item === 'object') {
        shell.exec('npm install ' + 'yapi-plugin-' + item.name)
      }
    })
    shell.exec('ykit pack -m');
  }

  utils.log('更新成功，请重启服务器')
}

module.exports = {
  setOptions: function (yargs) {
    yargs.option('v', {
      alias: 'v',
      describe: '部署版本'
    })
  },
  run: function (argv) {
    let result = run(argv);
    result.then(function () {
      process.exit(1);
    }).catch(function (err) {
      console.log('Error: ', err.message);
      process.exit(1);
    })
  },
  desc: '更新 YApi 平台版本'
}