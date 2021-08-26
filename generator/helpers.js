const fs = require('fs')
const path = require('path')

module.exports = function (api) {
  return {
    updateBabelConfig (callback) {
      let config, configPath

      const rcPath = api.resolve('./babel.config.js')
      const pkgPath = api.resolve('./package.json')
      if (fs.existsSync(rcPath)) {
        configPath = rcPath
        config = callback(require(rcPath))
      } else if (fs.existsSync(pkgPath)) {
        configPath = pkgPath
        config = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf8' }))

        if (config.babel) {
          config.babel = callback(config.babel)
        } else {
          // TODO: error handling here?
        }
      }

      if (configPath) {
        const moduleExports = configPath !== pkgPath ? 'module.exports = ' : ''

        fs.writeFileSync(
          configPath,
          `${moduleExports}${JSON.stringify(config, null, 2)}`,
          { encoding: 'utf8' }
        )
      } else {
        // TODO: handle if babel config doesn't exist
      }
    },

    updateMain (callback) {
      let content = fs.readFileSync(api.resolve(api.entryFile), { encoding: 'utf8' })

      let lines = content.split(/\r?\n/g)

      lines = callback(lines)

      content = lines.join('\n')
      fs.writeFileSync(api.resolve(api.entryFile), content, { encoding: 'utf8' })
    },

    //TODO: refactor since is equal to updateMain
    updateApp(callback){
      const appPath = api.resolve('./src/App.vue')

      let content = fs.readFileSync(appPath, { encoding: 'utf8' })
      let lines = content.split(/\r?\n/g)
        lines = callback(lines)

      content = lines.join('\n')
      fs.writeFileSync(appPath, content, { encoding: 'utf8' })
    }
  }
}
