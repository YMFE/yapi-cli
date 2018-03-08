const path = require('path');
const fs = require('fs-extra');
const urlApi = require('url');

const commandsDir = path.resolve(__dirname);
module.exports = {
	setOptions: function (yargs) {},
	run: function (argv) {
		let urlParse = urlApi.parse(argv._[1]);
		let hostname = urlParse.hostname;
		let port = urlParse.port || 80;
		let auth = urlParse.auth;
		let proxy = {};
		if(auth){
			//有验证
			proxy.auth = {
				username: auth.split(':')[0],
				password: auth.split(':')[1]
			}
		}
		proxy.host = hostname;
		proxy.port = port;


		fs.writeJson(`${commandsDir}/proxy.json`, proxy)
			.then(() => {
				console.log('代理配置成功!')
			})
			.catch(err => {
				console.error(err)
			})

	},
	desc: '配置代理'
}
