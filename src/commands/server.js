
const fs = require('fs-extra');
const path = require('path');
const utils = require('../utils.js');
const shell = require('shelljs');
const express = require('express');
const libRoot = path.resolve(__dirname, '..');
const axios = require('axios');
const fileExist = utils.fileExist;
function init(config) {
  let root = config.root;
  let data = {
    port: config.port,
    adminAccount: config.email,
    db: {
      servername: config.dbAddr,
      DATABASE: config.dbName,
      port: config.dbPort
    },
    mail: {
      enable: false,
      host: "smtp.163.com",
      port: 465,
      from: "***@163.com",
      auth: {
        user: "***@163.com",
        pass: "*****"
      }

    }
  }
  if(config.company){
    try{
      axios.post('http://yapi.demo.qunar.com/publicapi/statis', {company: config.company}).then(res=>{});
    }catch(e){}
  }
  if(fileExist(path.resolve(root, 'init.lock'))){
    throw new Error('系统已安装，如需重新安装，请清空数据库和删除init.lock文件');
  }
  if(config.enableDbAuth && config.dbUser){
    data.db.user = config.dbUser;
    data.db.pass = config.dbPass;
  }
  fs.ensureDirSync(root);
  fs.writeFileSync(path.resolve(root, 'config.json'), JSON.stringify(data, null, '   '));
  
}

module.exports = {
  setOptions: function (yargs) { },
  run: function (argv) {
    const app = express();
    require('express-ws')(app)
    const bodyParser = require('body-parser');
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    
    app.ws('/api/install', function(ws) {
      ws.on('message', function(config) {       
        try{
          config = JSON.parse(config)
          init(config);
          let yapiCliPath = path.resolve(libRoot, 'index.js');
          let client = shell.exec(`node ${yapiCliPath} install --v ${config.version} --dir ${config.root}`, {async: true});          
          client.stdout.on('data', function(res){
            ws.send(res);
          })
          client.stderr.on('data', function(res){
            ws.send(res);
          })
          client.on('close', function(){
            ws.send('---end---');    
          })
        }catch(e){
          ws.send(e.message);
          ws.send('---end---');
        }
        
      });
    });

    app.get('/api/base', function (req, res) {
      axios.get('http://yapi.demo.qunar.com/publicapi/versions').then(result=>{
        res.send({
          versions:  result.data,
          root: path.resolve(process.cwd(), 'my-yapi')
        })
      })
    })
    app.use(express.static(path.resolve(__dirname, './server')))
    app.listen(9090)
    console.log('在浏览器打开 http://0.0.0.0:9090 访问。非本地服务器，请将 0.0.0.0 替换成指定的域名或ip ');
    if (process.platform == 'wind32') {
      cmd = 'open';
    } else if (process.platform == 'linux') {
      cmd = 'xdg-open';
    } else if (process.platform == 'darwin') {
      cmd = 'open';
    }
    try{
      shell.exec(cmd +' http://0.0.0.0:9090', {async: true});
    }catch(err){}
  },
  desc: '可视化部署 YApi 平台'
}