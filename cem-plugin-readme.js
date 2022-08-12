import {accessSync, readFileSync, writeFileSync} from 'fs'

function generateInstallationInstructions({packageJson: {name}}) {
  return `## Installation
  Available on [npm](https://www.npmjs.com/) as [**${name}**](https://www.npmjs.com/package/${name}).
    \`\`\`
  $ npm install --save ${name}
  \`\`\``
}

function generateBrowserSupportInstructions() {
  return `## Browser Support
  Browsers without native [custom element support][support] require a [polyfill][].
    - Chrome
    - Firefox
    - Safari
    - Microsoft Edge
  [support]: https://caniuse.com/custom-elementsv1
  [polyfill]: https://github.com/webcomponents/custom-elements`
}

function generateTitle({packageJson: {name}}) {
  const formattedName = name
    .split('/')
    .at(-1)
    .replace(/-element$/, '')
  return `&lt;${formattedName}&gt; element`
}

function generateImportInstructions({packageJson: {name}}) {
return `### Script

Import as ES modules:

\`\`\`js
import '${name}'
\`\`\`

Include with a script tag:

\`\`\`html
<script type="module" src="./node_modules/${name}/dist/index.js">
\`\`\``
}

export function readme(options) {
  const {filename = 'README.md', exclude = [], title, preamble, footer} = options ?? {}

  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))

  return {
    name: 'readme',
    async packageLinkPhase({customElementsManifest}) {
      const content = [
        `# ${title || generateTitle({packageJson})}`,
        packageJson.description,
        preamble,
        generateInstallationInstructions({packageJson}),
        `## Usage`,
        generateImportInstructions({packageJson}),
      ]
      for (const module of customElementsManifest.modules) {
        for (const {name, tagName, description} of module.declarations.filter(x => x.customElement)) {
          if (exclude.includes(name)) continue
          content.push(`### ${tagName}`)
          content.push(description.trim())
        }
      }

      content.push(generateBrowserSupportInstructions())
      content.push(footer)

      writeFileSync(filename, content.filter(Boolean).join('\n\n'))
    }
  }
}
