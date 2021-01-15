### GaryCare 小程序

##### 几个月大的小宝宝喂奶、体温等需要记录的小程序工具

1. Taro 项目基于 node，请确保已具备较新的 node 环境（>=12.0.0），推荐使用 node 版本管理工具 [nvm](https://github.com/creationix/nvm) 来管理 node，这样不仅可以很方便地切换 node 版本，而且全局安装时候也不用加 sudo 了。

   ### CLI 工具安装[#](https://taro-docs.jd.com/taro/docs/GETTING-STARTED#cli-工具安装)

   首先，你需要使用 npm 或者 yarn 全局安装`@tarojs/cli`，或者直接使用[npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b):

   *# 使用 npm 安装 CLI*

   $ npm install -g @tarojs/cli

   *# OR 使用 yarn 安装 CLI*

   $ yarn global add @tarojs/cli

   *# OR 安装了 cnpm，使用 cnpm 安装 CLI*

   $ cnpm install -g @tarojs/cli

   

2. *# 使用 yarn 安装依赖*

   $ yarn

   *# OR 使用 cnpm 安装依赖*

   $ cnpm install

   *# OR 使用 npm 安装依赖*

   $ npm install



3. 选择微信小程序模式，需要自行下载并打开[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)，然后选择项目根目录进行预览。

微信小程序编译预览及打包（去掉 --watch 将不会监听文件修改，并会对代码进行压缩打包）

*# yarn*

$ yarn dev:weapp

$ yarn build:weapp

*# npm script*

$ npm run dev:weapp

$ npm run build:weapp

*# 仅限全局安装*

$ taro build --type weapp --watch

$ taro build --type weapp

*# npx 用户也可以使用*

$ npx taro build --type weapp --watch

$ npx taro build --type weapp