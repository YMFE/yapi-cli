const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');

module.exports = {
  setOptions: function (yargs) {},
  run: async function (argv) {
    let versions = await utils.getVersions();
    versions.forEach(v=>{
      console.log('v' + v);
    })
  },
  desc: '获取版本信息'
}