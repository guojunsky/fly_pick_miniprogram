const webpack = require('webpack')

module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                "process.env.IN_HOSTING": JSON.stringify(process.env.IN_HOSTING),
            }),
        ]
    }
}
