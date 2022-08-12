import {generateCustomData} from 'cem-plugin-vs-code-custom-data-generator'
import {readme} from './cem-plugin-readme.js'

export default {
  packagejson: true,
  globs: ['src/index.ts'],
  plugins: [
    readme(),
    generateCustomData()
  ]
}
