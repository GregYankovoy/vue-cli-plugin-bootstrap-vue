module.exports = (api, opts, rootOpts) => {
  const helpers = require('./helpers')(api)

  api.extendPackage({
    dependencies: {
      'bootstrap-vue': '^2.17.3',
      'bootstrap': '^4.5.2',
      'popper.js': '^1.16.1',
      'portal-vue': '^2.1.7'
    },
    devDependencies: {
      'sass': '^1.26.11',
      'sass-loader': '^10.0.2',
    }
  })

  if (opts.usePolyfill) {
    api.extendPackage({
      dependencies: {
        '@babel/polyfill': '^7.11.5',
        'mutationobserver-shim': '^0.3.7'
      }
    })
  }

  // Render bootstrap-vue plugin file
  const templateName = opts.useScss ? 'scss' : 'default'
  api.render(`./templates/${templateName}`)


  // adapted from https://github.com/Akryum/vue-cli-plugin-apollo/blob/master/generator/index.js#L68-L91
  api.onCreateComplete(() => {
    // Modify main.js
    helpers.updateMain(src => {
      const vueImportIndex = src.findIndex(line => line.match(/^import Vue/))

      src.splice(vueImportIndex + 1, 0, 'import \'./plugins/bootstrap-vue\'')

      return src
    })

    if(opts.useScss){
      

      //Modify App.vue (import bootstrap styles)
      helpers.updateApp(src => {
        let styleBlockIndex = src.findIndex(line => line.match(/^<style/))

        if(styleBlockIndex === -1){ //no style block found
          //create it with lang scss
          src.push(`<style lang="scss">`)
          src.push(`</style>`)

          styleBlockIndex = src.length - 2
        }
        else{
          //check if has the attr lang="scss"
          if(!src[styleBlockIndex].includes('lang="scss')){
            //if not, replace line with lang="scss"
            src[styleBlockIndex] = '<style lang="scss">'
          }
        }

        const bootstrapImportString = `@import "~@/assets/scss/vendors/bootstrap-vue/index";\n`
        src.splice(styleBlockIndex + 1, 0, bootstrapImportString)

        return src
      })
    }
    

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
        if (!src.find(l => l.match(/^(import|require).+mutationobserver-shim.*$/))) {
          src.unshift('import \'mutationobserver-shim\'')
        }
        if (!src.find(l => l.match(/^(import|require).+@babel\/polyfill.*$/))) {
          src.unshift('import \'@babel/polyfill\'')
        }
        return src
      })
    }
  })
}
