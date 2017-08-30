process.env.NODE_ENV = 'production';

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

webpack(webpackConfig, function(err) {
  if (err) throw err;
  console.log('Build complete.');
});