module.exports = (api, opts) => {
  // Resolve asset references from components
  api.chainWebpack(config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        const transformAssetUrls = options.transformAssetUrls || {}
        return {
          ...options,
          transformAssetUrls: {
            // Ensure defaults exist
            video: ['src', 'poster'],
            source: 'src',
            img: 'src',
            image: 'xlink:href',
            // Add any other pre defined custom asset items
            ...transformAssetUrls,
            // Add BootstrapVue specific component asset items
            'b-img': 'src',
            'b-img-lazy': ['src', 'blank-src'],
            'b-card': 'img-src',
            'b-card-img': 'img-src',
            'b-card-img-lazy': ['src', 'blank-src'],
            'b-carousel-slide': 'img-src',
            'b-embed': 'src'
          }
        }
      })

      if(opts.useScss){
        //Add bootstrap's variables globally
        const bootstrapVueVarImports = [
          '@import "~bootstrap/scss/_functions.scss"',
          '@import "~@/assets/scss/vendors/bootstrap-vue/_custom.scss"',
          '@import "~bootstrap/scss/_variables.scss"',
          '@import "~bootstrap/scss/_mixins.scss"',
          '@import "~bootstrap-vue/src/_variables.scss"',
        ]
        
        //add custom variables 
        api.chainWebpack(webpackConfig => {
          webpackConfig
            .module.rule('scss')
            .use('sass-loader')
            .options({
              prependData: bootstrapVueVarImports.join(';\n')
            })
        })
      }     
  })
}
