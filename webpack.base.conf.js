const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TransferWebpackPlugin = require('transfer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const utils = require('./webpack.utils')
const devMode = process.env.NODE_ENV === 'development'
const config = devMode ? require('./env-conf').dev : require('./env-conf').prod
let babelPlugins = []
if (['production', 'prod'].includes(process.env.NODE_ENV)) {
  // 去掉conosle
  babelPlugins.push('transform-remove-console')
}
module.exports = {
  entry: utils.getEntry(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'styles': path.resolve(__dirname, 'src/styles'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.json', '.wasm'],
    modules: ['node_modules']
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new TransferWebpackPlugin([{ from: 'static', to: 'static' }], path.resolve(__dirname, 'src')),
    new MiniCssExtractPlugin({
      filename: devMode ? 'css/[name].css' : 'css/[name].[hash].min.css'
    })
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use:[{
        loader: 'babel-loader',
        options: {
          presets: [
            ["@babel/preset-env", {
              useBuiltIns: 'entry'
            }]
          ],
          plugins: babelPlugins
        }
      }]
    }, {
      test: /\.(sass|scss|css)$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: devMode
        }
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 2
        }
      }, {
        loader: 'postcss-loader',
        options: {
          sourceMap: true
        }
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          prependData: '@import "~styles/variables.scss";'
        }
      }]
    }, {
      test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 4096,
          fallback: {
            loader: 'file-loader',
            options: {
              publicPath: config.publicPath ? `${config.publicPath}/images` : '../images',
              outputPath: 'images',
              name: '[name].[hash:8].[ext]'
            }
          }
        }
      }]
    }, {
      test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/i,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 4096,
          fallback: {
            loader: 'file-loader',
            options: {
              publicPath: config.publicPath ? `${config.publicPath}/fonts` : '../fonts',
              outputPath: 'fonts',
              name: '[name].[hash:8].[ext]'
            }
          }
        }
      }]
    }, {
      test: /\.html$/,
      use: {
        loader: 'html-loader',
        options: {
          attrs: ['img:src', 'img:data-src', 'audio:src'],
          minimize: true
        }
      }
    }]
  }
}
//配置页面
const entryObj = utils.getEntry()
let htmlArray = Object.keys(entryObj).map((element) => Object.assign({}, {
  _html: element,
  title:'',
  chunks: ['vendor', element]
}))
let fileList = []
//自动生成html模板
htmlArray.forEach((element) => {
  fileList.push(`views/${element._html}.html`)
  module.exports.plugins.push(new HtmlWebpackPlugin(utils.getHtmlConfig(element._html, element.chunks)))
})

if (devMode) {
  module.exports.plugins.push(new HtmlWebpackPlugin({
    templateContent: utils.getHtmlList(fileList),
    filename: 'index.html'
  }))
}
