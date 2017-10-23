const path = require('path');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const utils = require('../utils.js');
const shell = require('shelljs');

var root, config;
const wget = utils.wget;
const fileExist = utils.fileExist;
function connect(config) {
  mongoose.Promise = global.Promise;
  let options = {
    useMongoClient: true,
    connectTimeoutMS: 3000
  };
  if (config.db.user) {
      options.user = config.db.user;
      options.pass = config.db.pass;
  }
  
  return mongoose.connect(`mongodb://${config.db.servername}:${config.db.port}/${config.db.DATABASE}`, options);
}

function ensureFilepaths(root) {
  let filepaths = [
    root,
    path.resolve(root, 'vendors'),
    path.resolve(root, 'log')
  ]
  filepaths.forEach(function (dir) {
    fs.ensureDirSync(dir);
  })
}




async function verifyConfig(config){
  if(!config.port){
    throw new Error('端口没有配置, 请在 config.json 配置port')
  }
  if(!config.adminAccount){
    throw new Error('管理员账号没有配置, 请在 config.json 配置adminAccount');
  }
  if(!config.db || typeof config.db !== 'object'){
    throw new Error('请在 config.json 配置db')
  }
  try{
    await connect(config);
    utils.log('连接数据库成功!');
  }catch(e){
    throw new Error('连接数据库失败, '+ e.message)
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

function handleServerInstall(){
  return new Promise(function(resolve, reject){
    let child = shell.exec(`npm run install-server`,{async: true, silent: true});
    child.stdout.on('data', (data) => {
      console.log(` ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      reject({
        message: data
      });
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
  let nodeVersion = shell.exec('node -v', {silent: true}).substr(1);
  
  if(!utils.compareVersion('7.6', nodeVersion)){
    throw new Error('node 需要 7.6 或以上版本')
  }

  if(!fileExist(configFilepath)){
    throw new Error( '在项目目录找不到配置文件 config.json ');
  }
  config = require(configFilepath);
  if (!config || typeof config !== 'object') {
    throw new Error('config 配置有误');
  }  
  if(fileExist(path.resolve(root, 'init.lock'))){
    throw new Error('系统已安装，如需重新安装，请清空数据库和删除init.lock文件');
  }
  let v = argv.v;

  if(!v || typeof v !== 'string'){
    throw new Error('版本号不能为空');
  }
  utils.log(`当前安装版本： ${v}`) 
  ensureFilepaths(root);
  let domain = config.port == '80' ? 'http://127.0.0.1' : 'http://127.0.0.1:' + config.port
  try{
    await verifyConfig(config);
    let yapiPath = path.resolve(root, 'vendors');
    utils.log('开始下载平台文件压缩包...')
    await wget(yapiPath, v);  
    utils.log('部署文件完成，正在安装依赖库...')
    shell.cd(yapiPath);
    await handleNpmInstall();
    utils.log('依赖库安装完成，正在初始化数据库mongodb...')
    await handleServerInstall();
    utils.log(`部署成功，请切换到部署目录，输入： "node vendors/server/app.js" 指令启动服务器, 然后在浏览器打开 ${domain} 访问`);
  }catch(e){
    throw new Error(e.message)
  }
  
}

module.exports = {
  setOptions: function (yargs) {
    yargs.option('dir', {
      describe: '部署路径，默认为当前目录',
      default: process.cwd()
    })
    yargs.option('v', {
      alias: 'v',
      describe: '部署版本'
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
  desc: '部署 YApi 项目,建议使用 yapi server 进行可视化部署'
}