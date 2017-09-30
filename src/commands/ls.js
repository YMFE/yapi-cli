const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');

module.exports = {
  setOptions: function (yargs) {},
  run: function (argv) {
    axios.get('http://yapi.demo.qunar.com/publicapi/versions').then(res=>{
      res = res.data;
      if(res && Array.isArray(res)){
        res.forEach(item=>{
          console.log('v' + item.version);
        })
      }
    })
  },
  desc: '获取版本信息'
}