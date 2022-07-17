# 使用webpack5配置多页面
## 1. 安装node和npm
## 2. 新增package.json
```
npm init
```
> 按照提示输入信息

## 3. 新建目录
![image](http://www.ybaob.com/images/webpacklist.png)

## 4. 安装webpack
```
// webpack5 需要webpack-cli的包
npm install webpack webpack-cli --save-dev
```

## 5. 配置公共webpack配置

> webpack.base.conf.js

```
const path = require('path')
const webpack = require('webpack')
const utils = require('./webpack.utils') // 工具类，包括获取入口js文件和html方法
module.exports = {
    entry: utils.getEntry(), // 入口文件
    resolve: {
        alias: { // 别名
            '@': path.resolve(__dirname, 'src'),
            'styles': path.resolve(__dirname, 'src/styles'),
        },
        extensions: ['.mjs', '.js', '.jsx', '.json', '.wasm'],
        modules: ['node_modules'] // ~ 路径
    },
    plugins: [
        new webpack.ProgressPlugin(),
    ]
}
```
## 6. 工具类 (后面给)
## 7. copy-webpack-plugin 复制静态文件
直接复制源文件
```
npm install copy-webpack-plugin --save-dev
```
> webpack.base.conf.js

```
const CopyWebpackPlugin = require('copy-webpack-plugin')
...
module.exports = {
    ...,
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './public'),
                    to: devMode
                        ? path.resolve(__dirname, 'dist')
                        : path.resolve(__dirname, config.outputPath),
                    toType: 'dir',
                    globOptions: {
                        ignore: ['.DS_Store', 'index.html']
                    }
                }
            ]
        })
    ]
    ...
}
...
```

## 8. 多页面配置
```
npm install html-webpack-plugin --save-dev
```
> webpack.base.conf.js

```
const HtmlWebpackPlugin = require('html-webpack-plugin')
...,
module.exports = {
    ...
}

//配置页面
const entryObj = utils.getEntry()
let htmlArray = Object.keys(entryObj).map((element) => Object.assign({}, {
  _html: element,
  title: '',
  chunks: ['vendor', element]
}))
//自动生成html模板
htmlArray.forEach((element) => {
  module.exports.plugins.push(new HtmlWebpackPlugin(utils.getHtmlConfig(element._html, element.chunks)))
})
```
## 9. 使用babel-loader兼容低版本浏览器

> @babel/core 核心代码
> @babel/preset-env babel需要转换的版本
> @babel/plugin-transform-runtime 提供新api全局方法

```
npm install @babel/core @babel/preset-env babel-loader @babel/plugin-transform-runtime --save-dev
```
> babel 默认只转换新的JavaScript句法，而不转换新的API
> 需要使用@babel/core-js3提供新api全局方法
> 在入口js文件中引入（在webpack.utils.js中入口文件方法）

> webpack.base.conf.js

```
let babelPlugins = [
    ['@babel/plugin-transform-runtime', {
        corejs: 3
    }]
]
module.exports = {
    module: {
        rules: [
        ...,
        {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use:[{
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env']
                    ],
                    plugins: babelPlugins
                }
            }]
        },
        ...
        ]
    }
}
```

> 使用babel-plugin-transform-remove-console清楚打印信息

```
npm install babel-plugin-transform-remove-console --save-dev
```
> webpack.base.conf.js

```
let babelPlugins = []
if (['production', 'prod'].includes(process.env.NODE_ENV)) {
    // 去掉conosle
    babelPlugins.push('transform-remove-console')
}
module.exports = {
}
```

## 10. 使用scss预编译css
> postcss-loader autoprefixer 自动添加css兼容
> css-loader sass-loader 边夹scss

```
npm install css-loader sass-loader style-loader postcss-loader autoprefixer --save-dev
```

> 使用mini-css-extract-plugin合并css
```
npm install mini-css-extract-plugin --save-dev
```

> webpack.base.conf.js

```
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const devMode = process.env.NODE_ENV === 'development'
...,
module.exports = {
    plugins: [
        ...,
        new MiniCssExtractPlugin({
            filename: devMode ? 'css/[name].css' : 'css/[name].[hash].min.css'
        })
    ],
    module: {
        rules: [
            {
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
                  prependData: '@import "~styles/variables.scss";' // 引入scss全集变量
                }
              }]
            }
        ]
    }
}

```



## 11. 处理图片
```
npm install url-loader file-loader --save-dev
```
> webpack.base.conf.js

```
...,
module.exports = {
    module: {
        rules: [
            {
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
            }
        ]
    }
}
```
> file-loader的publicPath 是图片的绝对路径
> outputPath 图片打包的输入路径

## 12. 处理字体，主要使用iconfont图标
> webpack.base.conf.js

```
...,
module.exports = {
    module: {
        rules: [
            {
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
            }
        ]
    }
}
```

## 13. 处理html中的图片路径
```
npm install html-loader --save-dev
```

> webpack.base.conf.js

```
...,
module.exports = {
    module: {
        rules: [
            {
              test: /\.html$/,
              use: [{
                loader: 'html-loader',
                options: {
                  attrs: ['img:src', 'img:data-src', 'audio:src'],
                  minimize: true
                }
              }]
            }
        ]
    }
}
```

## 14. 配置开发环境
> 使用webpack-merge合并webpack配置

```
npm install webpack-merge --save-dev
```
> webpack.dev.conf.js

```
const path = require('path')
const merge = require('webpack-merge')
const config = require('./env-conf').dev
const webpackConfigBase = require('./webpack.base.conf')
const webpackConfigDev = {
    mode: 'development',
    output: {
        publicPath: '../',
        path: path.resolve(__dirname, config.publicPath || 'dist' ),
        filename: 'js/[name].bundle.js',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
          'process.env.BASE_URL': '\"' + process.env.BASE_URL + '\"'
        })
    ],
    devtool: 'source-map'
}
module.exports = merge(webpackConfigBase, webpackConfigDev)
```

> env-conf.js 是配置文件

## 15. 配置生产环境
> 使用optimize-css-assets-webpack-plugin压缩css
```
npm install optimize-css-assets-webpack-plugin --save-dev
```
> 使用clean-webpack-plugin删除旧打包文件
```
npm install clean-webpack-plugin --save-dev
```
> webpack.prod.conf.js

```
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpackConfigBase = require('./webpack.base.conf')
const config = require('./env-conf').prod
const webpackConfigDev = {
  mode: 'production',
  output: {
    publicPath: config.publicPath,
    path: path.resolve(__dirname, config.outputPath || 'dist' ),
    filename: 'js/[name].[hash].js',
  },
  optimization: { // 合并公共代码
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BASE_URL': '\"' + process.env.BASE_URL + '\"'
    }),
    //压缩css
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new CleanWebpackPlugin()
  ],
  devtool: false
}
module.exports = merge(webpackConfigBase, webpackConfigDev)
```

## 16. 配置开发服务器(webpack-dev-server v4)
> 使用 webpack-dev-server
```
npm install webpack-dev-server --save-dev
```
> 使用clean-terminal-webpack-plugin可以清空控制台并输入一些信息

> dev-server.js

```
const path = require('path')
const WebpackServer = require('webpack-dev-server')
const webpack = require('webpack')
const devConfig = require('./webpack.dev.conf')
const portfinder = require('portfinder')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const config = require('./env-conf').dev
const options = {
   devMiddleware: {
        publicPath: config.publicPath || '/'
    },
    static: {
        directory: path.resolve(__dirname, 'dist'),
        watch: true
    },
    watchFiles: ['src/*'],
    host: config.host,
    open: true
}
portfinder.basePort = config.port || 5000
portfinder.getPort((err, port) => {
  if (err) {
    console.log(err)
  } else {
    process.env.PORT = port
    devConfig.plugins.push(new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`可以打开浏览器浏览一下网址: http://${config.host}:${port}`]
      }
    }))
    const compiler = webpack(devConfig)
    const server = new WebpackServer(options, compiler)
    server.start(port)
  }
})
```

## 配置package.json中script
> package.json
```
"scripts": {
    "serve": "cross-env NODE_ENV=development node dev-server.js",
    "build": "cross-env NODE_ENV=production webpack --config webpack.prod.conf.js"
},
```
> 运行npm run serve 启动开发
> 运行npm run build 打包项目

## 注意
> 一个html必须又一个对应的js

## # 配置工具类webpack.utils.js
> 需要glob工具
```
npm install glob --save-dev
```
> webpack.utils.js

```
const glob = require('glob')
//动态添加入口
const getEntry = () => {
  let entry = {}
   glob.sync('./src/js/**/*.js').forEach((name) => {
    const start = name.indexOf('src/') + 4
    const end = name.length - 3;
    let eArr = [];
    let n = name.slice(start,end)
    n = n.split('/')[1]
    eArr.push(name)
    eArr.push('babel-polyfill')
    entry[n] = eArr
  })
  return entry
}

//动态生成html
const getHtmlConfig = function(name, chunks){
  return {
    template: `./src/views/${name}.html`,
    filename: `views/${name}.html`,
    inject: true,
    hash: false,
    chunks: chunks,
    minify: process.env.NODE_ENV === 'development' ? false : {
      removeComments: true, //移除HTML中的注释
      collapseWhitespace: true, //折叠空白区域 也就是压缩代码
      removeAttributeQuotes: true, //去除属性引用
    }
  }
}

module.exports = {
  getEntry,
  getHtmlConfig
}
```

## # 抽离配置文件env-conf.js
> env-conf.js
```
module.exports = {
  dev: {
    publicPath: '',
    host: 'localhost',
    port: 5000
  },
  prod: {
    publicPath: '/pages',
    outputPath: 'pages'
  }
}
```





