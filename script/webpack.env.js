/**
 * 环境变量使用插件
 */
const path = require('path')
const ymal = require('yaml')
const fs = require('fs')

module.exports = function envLoader(source) {
  const root = path.resolve(process.cwd())
  const configPath = path.resolve(root, '.appConfig.yaml')
  if (/\.json$/.test(this.resourcePath)) {

    console.log(this.resourcePath)
  }
  if (fs.existsSync(configPath)) {
    const appArgs = ymal.parse(fs.readFileSync(configPath, 'utf8'))
    return Object.keys(appArgs).reduce((p, next) => {
      const pattern = new RegExp(`AppArgs\\.${next}`, 'ig')
      if (pattern.test(source)) {
        return p.replace(pattern, appArgs[next])
      }
      return p

    }, source)
  }
  return source
}

module.exports.webpackResultResolver = function(compiler){
  compiler.hooks.emit.tap('WebpackResultResolver', compiltion=>{
     console.log(compiltion.assets['project.config'])
     return compiltion
  })
}