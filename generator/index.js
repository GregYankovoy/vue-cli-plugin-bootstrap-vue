module.exports = (api, opts, rootOpts) => {
  const helpers = require('./helpers')(api)

  api.extendPackage({
    dependencies: {
      'bootstrap-vue': '^2.0.0-rc.11'
    }
  })

  if (opts.usePolyfill) {
    api.extendPackage({
      devDependencies: {
        '@babel/polyfill': '^7.0.0-beta.53',
      }
    })
  }

  // Render bootstrap-vue plugin file
  api.render({
    './src/plugins/bootstrap-vue.js': './templates/default/src/plugins/bootstrap-vue.js'
  }, opts)

  // adapted from https://github.com/Akryum/vue-cli-plugin-apollo/blob/master/generator/index.js#L68-L91
  api.onCreateComplete(() => {
    // Modify main.js
    helpers.updateMain(src => {
      const vueImportIndex = src.findIndex(line => line.match(/^import Vue/))

      src.splice(vueImportIndex + 1, 0, 'import \'./plugins/bootstrap-vue\'')

      return src
    })

    // Add polyfill
    if (opts.usePolyfill) {
      helpers.updateBabelConfig(cfg => {
        if (!cfg.presets) return cfg

        const vuePresetIndex = cfg.presets.findIndex(p => Array.isArray(p) ? p[0] === '@vue/app' : p === '@vue/app')
        const isArray = Array.isArray(cfg.presets[vuePresetIndex])

        if (vuePresetIndex < 0) return cfg

        if (isArray) {
          cfg.presets[vuePresetIndex][1]['useBuiltIns'] = 'entry'
        } else {
          cfg.presets[vuePresetIndex] = [
            '@vue/app',
            {
              useBuiltIns: 'entry'
            }
          ]
        }

        return cfg
      })

      helpers.updateMain(src => {
        if (!src.find(l => l.match(/^(import|require).*@babel\/polyfill.*$/))) {
          src.unshift('import \'@babel/polyfill\'')
        }

        return src
      })
    }
  })
}
