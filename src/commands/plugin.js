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
    yargs.option('build', {
      alias: 'b',
      default: true,
      describe: '是否编译客户端代码，true 为编译, false 为不编译,  默认为 true'
    })
  },
  run: function (argv) {
    try {

      root = process.cwd();
      let configFilepath = path.resolve(root, 'config.json');
      if (!utils.fileExist(configFilepath)) {
        throw new Error('项目目录找不到配置文件 config.json ');
      }
      if( !shell.which('ykit')){
        throw new Error('需要安装 ykit ');
      }
      let name = argv.name;
      config = require(configFilepath);
      if (!config.plugins || !Array.isArray(config.plugins)) {
        config.plugins = [];
      }

      if (!name) {
        throw new Error('请输入需要安装的插件Name, yapi-cli plugin --name yapi-plugin-*** ')
      }
      if (name.indexOf('yapi-plugin-') !== 0) {
        throw new Error('插件name 前缀必需是 yapi-plugin-')
      }

      let pluginName = name.substr('yapi-plugin-'.length)
      if (_.find(config.plugins, plugin=>{
        if(!plugin) return null;
        if(typeof plugin === 'string'){
          return plugin == pluginName;
        }else if(typeof plugin === 'object'){
          return plugin.name == pluginName
        }
      })) {
        throw new Error('此插件已安装');
      }
      shell.cd('vendors');
      utils.log('正在下载插件...');
      shell.exec('npm install ' + name);
      utils.log('安装插件成功')
      config.plugins.push({
        name: pluginName
      }) 
      fs.writeFileSync(configFilepath, JSON.stringify(config, null, '   '));
      if(argv.build === true){
        utils.log('正在安装依赖...');
        shell.exec('npm install --registry https://registry.npm.taobao.org');
        shell.exec('ykit pack -m')        
        utils.log('编译客户端成功，请重启服务器')
      }
      
    } catch (e) {
      utils.log(e.message);
    }
  },
  desc: '插件安装'
}