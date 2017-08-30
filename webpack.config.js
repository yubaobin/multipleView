var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var util = require('./util');
var appPath = path.resolve(__dirname,'./app/');
var jsPath = path.resolve(__dirname,'./app/js/');
var port = 8085;

var config = {
	entry: {
	  main: path.resolve(appPath, 'main') // 用数组，app名字包含多个js
	},
	output: {
	  path: path.resolve(__dirname,'dist'),
	  filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
	},
	plugins: [
    new ExtractTextPlugin("styles.css"), //将css，less打包成styles.css
    new webpack.ProvidePlugin({ //全局配置加载
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
	],
	module: {
	  rules:[{
		test: /\.js$/,
		include: appPath,
        use: [{
          loader: "babel-loader",
          options: { presets: ["es2015"] }
        }],
	  }, {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          loader: ["css-loader","sass-loader"]
        })
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 100,
		  name: "images/[name].[hash:7].[ext]"
        }
      },{
        test: /\.html$/,
        use: [ {
          loader: 'html-loader', //使用html-loader编译html
          options: {
            minimize: false,
            collapseWhitespace: false
          }
        }],
      }]
	},
	resolve: {
	  //自动扩展文件后缀，在使用require时省略后缀名
    extensions: ['.js', '.json', '.jsx', '.vue','.scss'],
    alias: {
  	  'style': path.resolve(__dirname,'./app/styles/'),
  	  'view': path.resolve(__dirname,'./app/view')
    }
	},
	// 服务器配置相关，自动刷新!
  devServer: {
    historyApiFallback: true,
    inline: true,
    port:port
  }
}

var jsFiles = util.jsFile;
for(var item in jsFiles) {
  config.entry[item] = jsFiles[item];
}
console.log(config.entry);
var htmlFiles = util.htmlFile;
//生成HTML模板
htmlFiles.forEach(function(pathname) {
    var conf = {
    	title: pathname.name,
		  filename: pathname.name + '.html', //生成的html存放路径,相对于path
		  template: pathname.path, //html模板路径
		  inject: true, //允许插件修改哪些内容,包括head与body
		  hash: false, //是否添加hash值
		  minify: { //压缩HTML文件
		    removeComments: true,//移除HTML中的注释
		    collapseWhitespace: false //删除空白符与换行符
      },
      chunks:['main', pathname.js], //编译的时候需要引入entry中制定的js
    };
    config.plugins.push(new HtmlWebpackPlugin(conf));
});
module.exports = config



