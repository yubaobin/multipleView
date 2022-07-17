const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const webpackConfigBase = require('./webpack.base.conf')
const config = require('./env-conf').dev
const webpackConfigDev = {
    mode: 'development',
    output: {
        publicPath: '../',
        path: path.resolve(__dirname, config.publicPath || 'dist'),
        filename: 'js/[name].bundle.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.BASE_URL': '"' + process.env.BASE_URL + '"'
        })
    ],
    devtool: 'source-map'
}
module.exports = merge(webpackConfigBase, webpackConfigDev)
