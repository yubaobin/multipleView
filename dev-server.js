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
