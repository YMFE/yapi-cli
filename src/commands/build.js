const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');
const _ = require('underscore');
let root, config;
module.exports = {
  setOptions: function () { 

  },
  run: function (argv) {
    try {

      root = process.cwd();
      let configFilepath = path.resolve(root, 'config.json');
      if (!utils.fileExist(configFilepath)) {
        throw new Error(utils.message.fount_project_path_error);
      }
      let name = argv.name;
      
      shell.cd('vendors');
      utils.log('正在安装依赖...');
      shell.exec('npm install --registry https://registry.npm.taobao.org');
      utils.log('依赖安装完成，正在编译客户端')
      shell.exec('ykit pack -m')
      utils.log('已编译客户端，请重启服务器')
    } catch (e) {
      utils.log(e.message);
    }
  },
  desc: '插件安装'
}