const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs');
const utils = require('./utils');
const commandsDir = path.resolve(__dirname, 'commands');
var commands = [];
var commandsFile = fs.readdirSync(commandsDir);
commandsFile.forEach(function (file) {
  if (path.extname(file) !== '.js') return null;
  let commandModule = require(path.resolve(commandsDir, file));
  if (!commandModule) {
    throw new Error('找不到 module 在 ' + file + '文件');
  }
  let commandName = path.basename(file, '.js');
  yargs.command(commandName, commandModule.desc, commandModule.setOptions, commandModule.run);
})

try {
  yargs.argv;
  if (yargs.argv._.length === 0) {
    const root = process.cwd();
    let configFilepath = path.resolve(root, 'config.json');
    if (!utils.fileExist(configFilepath)) {
      return console.log('在项目目录找不到配置文件 config.json,请确认是否安装项目到此目录');
    }
    let package = require(path.resolve(root, './vendors/package.json'));
    console.log(`当前项目版本是：${package.version}`)
  }

} catch (e) {
  console.error(e);
}


