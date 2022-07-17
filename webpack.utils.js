const glob = require('glob')
// 动态添加入口
const getEntry = () => {
    const entry = {}
    glob.sync('./src/js/**/*.js').forEach((name) => {
        const start = name.indexOf('src/') + 4
        const end = name.length - 3
        const eArr = []
        let n = name.slice(start, end)
        n = n.split('/')[1]
        eArr.push(name)
        entry[n] = eArr
    })
    return entry
}

// 动态生成html
const getHtmlConfig = (name, chunks) => {
    return {
        template: `./src/views/${name}.html`,
        filename: `views/${name}.html`,
        inject: true,
        hash: false,
        chunks: chunks,
        minify: process.env.NODE_ENV === 'development' ? false : {
            removeComments: true, // 移除HTML中的注释
            collapseWhitespace: true, // 折叠空白区域 也就是压缩代码
            removeAttributeQuotes: true // 去除属性引用
        }
    }
}

// 生成文件列表
const getHtmlList = (list) => {
    const html = []
    html.push('<html><body><ul>')
    list.forEach(item => {
        html.push(`<li><a href="${item}">${item}</a></li>`)
    })
    html.push('</ul></body></html>')
    return html.join('')
}

module.exports = {
    getEntry,
    getHtmlConfig,
    getHtmlList
}
