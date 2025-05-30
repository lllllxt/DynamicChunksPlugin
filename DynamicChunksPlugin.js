/**
 * hack：html-webpack-plugin@3.x版本动态注入资源bug
 * 
 * @author lllllxt
 * @see https://github.com/lllllxt/DynamicChunksPlugin
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

module.exports = DynamicChunksPlugin