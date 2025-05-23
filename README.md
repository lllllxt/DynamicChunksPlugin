# DynamicChunksPlugin 动态注入包
> 仅适用于 html-webpack-plugin@3.x

> hack：@vue/cli@4.x下，配置多页面和splitChunk导致静态资源注入失败问题




# 技术背景
  `@vue/cli-service@4.x`下，配置了多页面（pages)，且自定义了splitChunks，splitChunks中有的包被分割了，分割后如`index~123.111.js`，`index~123.222.js`。其中`index~123`是chunkName
  而`html-webpack-plugin@3.x`中，是判断 `includedChunks.indexOf(chunkName)===-1` 以过滤需要注入的chunk名。

# 问题
  由于`index~123`中`123`是动态不确定的，在配置pages时无法获取splitChunks后的动态chunkName，导致生产构建后无法向html注入script标签。

# 解决方案
  1. 据说升级html-webpack-plugin到4或5可解决这个问题（实测更多屁事，根本解决不完），
  况且@vue/cli-service@4.x 强依赖了html-webpack-plugin@3.x，即使单独升级html-webpack-plugin到更高版本也没用
  2. 升级@vue/cli 到5就没这些屁事了（没实测，手上项目较大，升级成本比较高 也无法预估风险）
  3. 用我写这个Plugin，完美解决

# 使用方法

受众不多，就不发布npm了，自行copy使用吧
```
<!-- vue.config.js -->
import DynamicChunksPlugin from './plugin/DynamicChunksPlugin'

const IS_DEV = process.env.NODE_ENV === 'development'
// way1
...
plugins: [...(IS_DEV?[new DynamicChunksPlugin()]:[])]
...

// way2
...
chainWebpack: config => {
  ...
  config.when(!IS_DEV, config=>{
    config.plugin('dynamic-chunks-plugin').use(DynamicChunksPlugin)
  })
  ...
}
...


```

# 参考资料
https://juejin.cn/post/7278286913945387068

https://blog.csdn.net/suckshit/article/details/122897416

https://github.com/vuejs/vue-cli/issues/4944