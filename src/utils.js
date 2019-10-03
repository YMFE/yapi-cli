const download = require('download');
const fs = require('fs');
const semver = require('semver')
const axios = require('axios')

function oldVersion(){
  return [
    "1.4.1",
    "1.3.23",
    "1.3.22",
    "1.3.21",
    "1.3.20",
    "1.3.19",
    "1.3.18",
    "1.3.17",
    "1.3.16",
    "1.3.14",
    "1.3.12",
    "1.3.11",
    "1.3.9",
    "1.3.8",
    "1.3.7",
    "1.3.6",
    "1.3.5",
    "1.3.4",
    "1.3.3",
    "1.3.1",
    "1.2.9",
    "1.2.8",
    "1.2.7",
    "1.2.5",
    "1.2.4",
    "1.2.3",
    "1.2.0",
    "1.1.2",
    "1.1.1",
    "1.1.0"
  ]
}


function github(version, type = 'npm') {
  let url;
  if(version[0] === 'v' || version[0] === 'V'){
    version = version.substr(1)
  }

  if(oldVersion().indexOf(version) !== -1){
    type = 'qunar'
  }

  if(type === 'github'){
    version = 'v' + version;
    url = 'https://github.com/YMFE/yapi/archive/' + version + '.zip'
  }else if(type === 'npm'){
    url = `http://registry.npm.taobao.org/yapi-vendor/download/yapi-vendor-${version}.tgz`
  }else {
    version = 'v' + version;
    url = 'http://yapi.demo.qunar.com/publicapi/archive/' + version;
  }
  return url
}
module.exports ={
  message:{
    'fount_project_path_error': '项目目录找不到配置文件 config.json, 请确认当前目录是否为项目目录'
  },

  getVersions: async function(){
    let info = await axios.get('http://registry.npm.taobao.org/yapi-vendor');
    let versions = Object.keys(info.data.versions).filter(item => (item.indexOf('beta') === -1));
    return [].concat(versions, oldVersion())
  },

  log: function(msg){
    console.log(msg);
  },
  error: function(error){
    console.error(error);
  },
  wget: function ( dest, v, type) {
    const url = github(v, type);
    const cmd = download(url, dest, { extract: true, strip: 1 });
    console.log(url)
    cmd.stdout = process.stdout;  
    return cmd;
  },
  fileExist: function (filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  },
  compareVersion: function compareVersion(version, bigVersion){
    version = version.split(".");
    bigVersion = bigVersion.split(".");
    for(let i = 0; i< version.length; i++){
      version[i] = +version[i];
      bigVersion[i] = +bigVersion[i];
      if(version[i] > bigVersion[i]){
        return false;
      }else if(version[i] < bigVersion[i]){
        return true;
      }
    }
    return true;
  },
  handleVersion: function(version){
    if(!version) return version;
    version = version  + '';
    if(version[0] === 'v'){
      return version.substr(1);
    }
    return version;
  }
}