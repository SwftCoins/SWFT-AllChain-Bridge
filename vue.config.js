// vue.config.js

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  publicPath: './',
  parallel: false,
  assetsDir: './static',
  outputDir: 'dist',
  assetsDir: '',
  indexPath: 'index.html',
  filenameHashing: true,
  lintOnSave: false,
  runtimeCompiler: false,
  transpileDependencies: [],
  productionSourceMap: false,
  crossorigin: undefined,
  integrity: false,
  devServer: {
    open: true, 
    host: 'localhost', 
    port: '8080',
    https: false,
    hotOnly: false,
    proxy: {
      '/api/*': {
        target: 'https://transfer.swft.pro',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api',
        },
      },
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(new UglifyJsPlugin())
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      return {
        optimization: {
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 20000,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name (module) {
                  const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `chunk-vendors${packageName.replace('@', '').charCodeAt()}`
                }
              }
            }
          }
        },
        plugins: [
          new CompressionPlugin({
            test: /\.(js|css)(\?.*)?$/i,
            threshold: 10240, 
            deleteOriginalAssets: false, 
          }),
        ],
        module:{
          rules:[
            {
              test: /\.js$/,
              loader: require.resolve('@open-wc/webpack-import-meta-loader'),
            }
          ],
        },
      }
    }else{
      return {
        module:{
          rules:[
            {
              test: /\.js$/,
              loader: require.resolve('@open-wc/webpack-import-meta-loader'),
            }
          ]
        },
    }
    }
  }
}
