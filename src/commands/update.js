const path = require('path');
const fs = require('fs-extra');
const download = require('download');
const utils = require('../utils.js');
const shell = require('shelljs');
shell.config.fatal = true;

var root, config;

function wget( dest) {
  const url = github('dev');
  const cmd = download(url, dest, { extract: true, strip: 1 });
  cmd.stdout = process.stdout;  
  return cmd;
}

function github(version) {
  return 'http://gitlab.corp.qunar.com/mfe/yapi/repository/archive.zip?ref=' + version;
}

function fileExist(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

function handleNpmInstall(){
  return new Promise(function(resolve, reject){
    let child = shell.exec('npm install -q --production --registry https://registry.npm.taobao.org', {async: true, silent: true});
    child.stdout.on('data', (data) => {
      console.log(` ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      console.log(` ${data}`);
    });
    
    child.on('close', (code) => {
      resolve(true);
    });
  })
}

async function run(argv){
  root = argv.dir;
  let configFilepath = path.resolve(root, 'config.json');
  
  if(!shell.which('node') || !shell.which('npm')){
    throw new Error('需要配置 node 和 npm 环境');
  }
  let nodeVersion = parseFloat(shell.exec('node -v', {silent: true}).substr(1));
  
  if(nodeVersion < 7.6){
    throw new Error('node 需要 7.6 或以上版本')
  }
  if(!fileExist(configFilepath)){
    throw new Error( '在项目目录找不到配置文件 config.json ');
  }
  
  let yapiPath = path.resolve(root, 'vendors');
  
  utils.log('开始下载平台文件压缩包...')
  await wget(yapiPath);  
  utils.log('部署文件完成，正在执行 npm install...')
  shell.cd(yapiPath);
  await handleNpmInstall();
  utils.log('部署成功，请切换到部署目录，输入： "node vendors/server/app.js" 指令启动服务器')  
}

module.exports = {
  setOptions: function (yargs) {
    yargs.option('dir', {
      describe: '部署路径，默认为当前目录',
      default: process.cwd()
    })
  },
  run: function (argv) {
    let result = run(argv);
    result.then(function(){
      process.exit(1);
    }).catch(function (err){
      console.log('Error: ', err.message);
      process.exit(1);
    })
  },
  desc: '更新 YApi 平台版本'
}