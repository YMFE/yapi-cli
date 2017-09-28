
const fs = require('fs-extra');
const path = require('path');
const utils = require('../utils.js');
const shell = require('shelljs');
const express = require('express');
const libRoot = path.resolve(__dirname, '..');

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
  if(config.enableDbAuth && config.dbUser){
    config.db.user = config.dbUser;
    config.db.pass = config.pass;
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
        config = JSON.parse(config)
        init(config);
        let yapiCliPath = path.resolve(libRoot, 'index.js');
        let client = shell.exec(`node ${yapiCliPath} install --dir ${config.root}`, {async: true});  
        client.stdout.on('data', function(res){
          ws.send(res);
        })
        client.stderr.on('data', function(res){
          ws.send(res);
        })
        client.on('close', function(){
          ws.send('---end---')          
        })
      });
    });

    app.get('/api/base', function (req, res) {
      res.send({
        versions: require('../config.js').versions ,
        root: path.resolve(process.cwd(), 'my-yapi')
      })
    })
    app.use(express.static(path.resolve(__dirname, './server')))
    app.listen(9090)
    console.log('在浏览器打开 http://127.0.0.1:9090 ');
    if (process.platform == 'wind32') {
      cmd = 'start "%ProgramFiles%\Internet Explorer\iexplore.exe"';
    } else if (process.platform == 'linux') {
      cmd = 'xdg-open';
    } else if (process.platform == 'darwin') {
      cmd = 'open';
    }
    try{
      shell.exec(cmd +' http://127.0.0.1:9090', {silent: true});
    }catch(err){}
  },
  desc: '部署 YApi 项目'
}