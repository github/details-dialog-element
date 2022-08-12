import {generateCustomData} from 'cem-plugin-vs-code-custom-data-generator'

export default {
  packagejson: true,
  globs: ['src/index.ts'],
  plugins: [
    generateCustomData()
  ]
}
