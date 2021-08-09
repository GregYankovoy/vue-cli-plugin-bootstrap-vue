module.exports = [
  {
    name: 'usePolyfill',
    type: 'confirm',
    message: 'Use babel/polyfill?',
    default: true
  },
  {
    name: 'useScss',
    type: 'confirm',
    default: false,
    message: 'Use scss?'
  },
  {
    when: answers => !!answers.useScss,
    name: 'injectAbstracts',
    type: 'confirm',
    default: false,
    message: 'Would you like to inject vars, functions and mixins in all SFC components?'
  }
]
