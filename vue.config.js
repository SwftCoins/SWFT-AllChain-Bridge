const { defineConfig } = require('@vue/cli-service')
const CompressionPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin //项目大小分析图
const path = require('path');
const webpack = require('webpack')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false,//关闭语法检查
  productionSourceMap: false,
  publicPath: './',
  parallel: false,
  assetsDir: './static',
  outputDir: 'dist',
  assetsDir: '',
  devServer: {
    hot: true, // 启用热模块替换（HMR）
    port: 8080, // 更改开发服务器的端口
    open: true, // 自动打开浏览器
    compress: true, // 启用gzip压缩
    proxy: {
      '/api/*': {
        target: 'https://transfer.swft.pro', //API服务器的地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api',
        },
      },
    },
  },
  configureWebpack: (config) =>{
    if (process.env.NODE_ENV === 'production'){
      return{
        resolve: {
          extensions: ['.js', '.vue', '.json'], // 自动解析确定的扩展名，使我们在引入模块时不需要写扩展名
           alias: {
             // 创建别名，简化导入路径
             '@': path.resolve(__dirname, 'src'),
             "stream": "stream-browserify",
           },
           fallback: {
             // 使用 crypto-browserify 替代 Node.js 的 crypto 模块
             "stream": require.resolve('stream-browserify'),
             "crypto": require.resolve("crypto-browserify"),
           },
         },
         optimization: {
           runtimeChunk: 'single',
           splitChunks: {
             chunks: 'async',
             maxInitialRequests: Infinity,
             minSize: 200000,
             maxSize: 600000, //会尝试根据这个大小进行代码分割
             minChunks: 1, //制定用了几次才进行代码分割
             cacheGroups: {
               default: {
                 minChunks: 2, //被引用两次就提取出来
                 priority: -20,
                 reuseExistingChunk: true, //检查之前是否被引用过有的话就不被打包了
               },
             }
           }
         },
         plugins: [
           new webpack.ProvidePlugin({
             Buffer: ['buffer', 'Buffer'],
           }),
           new CompressionPlugin({
             test: /\.(js|css)(\?.*)?$/i, //需要压缩的文件正则
             threshold: 10240, //文件大小大于这个值时启用压缩
             deleteOriginalAssets: false, //压缩后保留原文件
           }),
           new BundleAnalyzerPlugin()
         ]
      }
    }else{
      return{
        resolve: {
          extensions: ['.js', '.vue', '.json'], // 自动解析确定的扩展名，使我们在引入模块时不需要写扩展名
           alias: {
             // 创建别名，简化导入路径
             '@': path.resolve(__dirname, 'src'),
             "stream": "stream-browserify"
           },
           fallback: {
             // 使用 crypto-browserify 替代 Node.js 的 crypto 模块
             "stream": require.resolve('stream-browserify'),
             "crypto": require.resolve("crypto-browserify"),
           },
         },
         plugins: [
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
          }),
        ]
      }
    }
  },
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer('terser').tap((args) => {
        args[0].terserOptions.compress.drop_console = true;
        return args;
      });
    }
  },
 
})
