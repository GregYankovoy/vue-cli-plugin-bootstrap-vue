const fs = require('fs')

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
    helpers.updateFile(api.resolve(api.entryFile), srcLines => {
      const vueImportIndex = srcLines.findIndex(line => line.match(/^import Vue/))
        srcLines.splice(vueImportIndex + 1, 0, 'import \'./plugins/bootstrap-vue\'')
    })

    if(opts.useScss){
      //Modify App.vue (import bootstrap styles)
      helpers.updateFile(api.resolve('./src/App.vue'), srcLines => {
        let styleBlockIndex = srcLines.findIndex(line => line.match(/^<style/))

        if(styleBlockIndex === -1){ //no style block found
          //create it with lang scss
          srcLines.push(`<style lang="scss">`)
          srcLines.push(`</style>`)

          styleBlockIndex = srcLines.length - 2
        }
        else{
          //check if has the attr lang="scss"
          if(!srcLines[styleBlockIndex].includes('lang="scss')){
            //if not, replace line with lang="scss"
            srcLines[styleBlockIndex] = '<style lang="scss">'
          }
        }

        const bootstrapImportString = `@import "~@/assets/scss/vendors/bootstrap-vue/index";`
        srcLines.splice(styleBlockIndex + 1, 0, bootstrapImportString)
      })

      if(opts.injectAbstracts){
        //create/modify vue.config.js
        const vueConfigPath = api.resolve('./vue.config.js')
        if(!fs.existsSync(vueConfigPath)){
          const content = `module.exports = {\n}`
          fs.writeFileSync(vueConfigPath, content, { encoding: 'utf-8' })
        }

        helpers.updateFile(vueConfigPath, srcLines => {
          let index = 0
          srcLines.splice(index, 0, `const bootstrapSassAbstractsImports = require('vue-cli-plugin-bootstrap-vue/sassAbstractsImports.js')`)
          
          const bootstrapAbstractsContentLines = [
            "\tcss: {",
            "\t\tloaderOptions: {",
            "\t\t\tsass: {",
            "\t\t\t\tadditionalData: bootstrapSassAbstractsImports.join('\\n')",
            "\t\t\t},",
            "\t\t\tscss: {",
            "\t\t\t\tadditionalData: [...bootstrapSassAbstractsImports, ''].join(';\\n')",
            "\t\t\t}",
            "\t\t}",
            '\t}'
          ]
          index = srcLines.length - 1
          srcLines.splice(index, 0, bootstrapAbstractsContentLines.join('\n'))

        })
      }
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

      helpers.updateFile(api.resolve(api.entryFile), srcLines => {
        if (!srcLines.find(line => line.match(/^(import|require).+mutationobserver-shim.*$/))) {
          srcLines.unshift('import \'mutationobserver-shim\'')
        }
        if (!srcLines.find(line => line.match(/^(import|require).+@babel\/polyfill.*$/))) {
          srcLines.unshift('import \'@babel/polyfill\'')
        }
      })
    }
  })
}
