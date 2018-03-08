const download = require('download');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const semver = require('semver')

const commandsDir = path.resolve(__dirname, 'commands');

var utils;
function github(version, type) {
  let url;
  type = type || 'yapi';
  if(type === 'github'){
    url = 'https://github.com/YMFE/yapi/archive/' + version + '.zip'
  }else{
    url = 'http://yapi.demo.qunar.com/publicapi/archive/' + version;
  }
  console.log(url);
  return url
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
  wget: function ( dest, v, type) {
    const url = github(v, type);
    let proxy = {};
    let opt = {
    	extract: true,
		strip: 1
	}
	let protocol = type === 'github' ? 'https' : 'http';
	  try {
    	proxy = fsExtra.readJsonSync(`${commandsDir}/proxy.json`);
		opt.proxy = `${protocol}://${proxy.host}:${proxy.port}`;
	} catch (err) {
    	console.log(err);
		proxy = {};
	}
	const cmd = download(url, dest, opt);
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