# YApi 平台部署工具
使用我们提供的 yapi-cli 工具，部署和升级 YApi 平台是非常容易的
## 环境要求
* nodejs（7.6+)
* mongodb（2.6+）
## 安装
执行 yapi-cli server 启动可视化部署程序，输入相应的配置和点击开始部署，就能完成整个网站的部署。部署完成之后，可按照提示信息，执行 node/{网站路径/server/app.js} 启动服务器。在浏览器打开指定url, 点击登录输入您刚才设置的管理员邮箱，默认密码为 ymfe.org 登录系统（默认密码可在个人中心修改）。

    npm install -g yapi-cli --registry https://registry.npm.taobao.org
    yapi-cli server 

## 升级
升级项目版本是非常容易的，并且不会影响已有的项目数据，只会同步 vendors 目录下的源码文件。
```
cd  {项目目录}
yapi-cli ls //查看版本号列表
yapi-cli update //更新到最新版本
yapi-cli update -v {Version} //更新到指定版本
```