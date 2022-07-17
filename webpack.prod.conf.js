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
        path: path.resolve(__dirname, config.outputPath || 'dist'),
        filename: 'js/[name].[hash].js'
    },
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: 'initial',
                    name: 'chunk-vendor',
                    priority: 2
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
            'process.env.BASE_URL': '"' + process.env.BASE_URL + '"'
        }),
        // 压缩css
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
