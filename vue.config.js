const webpack = require('webpack')
const { webpackResultResolver } = require('./script/webpack.env')
module.exports = {
    configureWebpack: {
        module: {
          rules: [{
              test: /\.js(on)?$/,
              loader: require.resolve('./script/webpack.env')
          }]
        },
        plugins: [
            webpackResultResolver,
            new webpack.DefinePlugin({
                "process.env.IN_HOSTING": JSON.stringify(process.env.IN_HOSTING),
            }),
        ]
    }
}
