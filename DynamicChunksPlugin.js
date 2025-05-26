/**
 * html-webpack-plugin@3.x版本，动态注入资源
 * 据说html-webpack-plugin@4 @5 已经修复了，那就不要用这个plugin了
 * 
 * 技术背景：
 *   @vue/cli-service@4.x中，
 *   在vue-cli配置多页面（pages)，且自定义的splitChunks,splitChunks中有的包被分割了，分割后如index~123.111.js,index~123.222.js。
 *   而html-webpack-plugin@3.x中，是判断 includedChunks.indexOf(chunkName)===-1 以过滤需要注入的chunk名。
 * 问题：
 *   由于index~123中“123”是动态，在配置pages时无法获取splitChunks后的动态chunkName，导致构建后无法向html注入script标签。
 * 解决：
 *   据说升级html-webpack-plugin到4或5可解决这个问题(实测更多屁事)，
 *   况且@vue/cli-service@4.x 强依赖了html-webpack-plugin@3.x，即使单独升级html-webpack-plugin到更高版本也没用。
 *   
 *   也可以升级@vue/cli 到5就没这些屁事了，
 *   但奈何项目较大，升级成本比较高 也无法预估风险，故写下此插件
 * 
 */
class DynamicChunksPlugin {
  apply(compiler) {
    // 注册compilation钩子HtmlWebpackPlugin 3
    compiler.hooks.compilation.tap('DynamicChunksPlugin', compilation => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync('DynamicChunksPlugin', (data, cb) => {
        const plugin = data.plugin // HtmlWebpackPlugin实例

        const allowChunks = plugin.options.chunks // vue.config.js 中pages配置的

        const allChunks = compilation.getStats().toJson().chunks
        // 过滤需要的chunks
        let chunks = allChunks.filter(chunk => chunk.names.some(name => allowChunks.some(v => name.includes(v))))
        // 获取到splitChunk切包后的chunks后，调用HtmlWebpackPlugin实例内部方法排序
        // Sort chunks
        chunks = plugin.sortChunks(chunks, plugin.options.chunksSortMode, compilation)
        // 调用HtmlWebpackPlugin实例内部方法获取静态资源配置
        // Get assets
        const assets = plugin.htmlWebpackPluginAssets(compilation, chunks)
        // Merge assets 直接data.assets={} 不会作用到后续生命周期钩子中
        Object.assign(data.assets, assets)

        cb(null, data)
      })
    })
  }
}

module.export = DynamicChunksPlugin