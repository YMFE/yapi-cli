const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');
const _ = require('underscore');
let root, config;
module.exports = {
  setOptions: function (yargs) { 
    yargs.option('name', {
      alias: 'n',
      describe: '插件名，需要写前缀 yapi-plugin- '
    })
  },
  run: function (argv) {
    try {

      root = process.cwd();
      let configFilepath = path.resolve(root, 'config.json');
      if (!utils.fileExist(configFilepath)) {
        throw new Error('项目目录找不到配置文件 config.json ');
      }
      let name = argv.name;
      config = require(configFilepath);
      if (!config.plugins || !Array.isArray(config.plugins)) {
        throw new Error('还没有安装插件');
      }

      if (!name) {
        throw new Error('请输入需要卸载的插件Name, yapi-cli plugin uninstall --name yapi-plugin-*** ')
      }
      if (name.indexOf('yapi-plugin-') !== 0) {
        throw new Error('插件name 前缀必需是 yapi-plugin-')
      }

      let pluginName = name.substr('yapi-plugin-'.length);
      config.plugins = config.plugins.filter(plugin=>{
        if(typeof plugin === 'string'){
          return plugin !== pluginName;
        }else if(typeof plugin === 'object'){
          return plugin.name !== pluginName;
        }
        return true;

      })
      fs.writeFileSync(configFilepath, JSON.stringify(config, null, '   '));
      shell.cd('vendors');
      utils.log('正在编译客户端')
      shell.exec('ykit pack -m')
      
      utils.log('卸载插件成功，请重启服务器')
    } catch (e) {
      utils.log(e.message);
    }
  },
  desc: '插件卸载'
}