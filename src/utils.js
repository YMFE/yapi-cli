const download = require('download');
const fs = require('fs');
const semver = require('semver')
var utils;
function github(version) {
  version = 'v' + utils.handleVersion(version);
  console.log('https://github.com/YMFE/yapi/archive/' + version + '.zip');
  return 'https://github.com/YMFE/yapi/archive/' + version + '.zip';
}
module.exports = utils =  {
  message:{
    'fount_project_path_error': '项目目录找不到配置文件 config.json, 请确认当前目录是否为项目目录'
  },
  log: function(msg){
    console.log(msg);
  },
  error: function(error){
    console.error(error);
  },
  wget: function ( dest, v) {
    const url = github(v);
    const cmd = download(url, dest, { extract: true, strip: 1 });
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