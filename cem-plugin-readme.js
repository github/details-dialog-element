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

function generateDescription({packageJson: {description}}) {
  return description
}

export function readme(options) {
  const {filename = 'README.md', exclude = [], title, preamble, footer} = options ?? {}

  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))

  return {
    name: 'readme',
    async packageLinkPhase({customElementsManifest}) {
      const content = [
        `# ${title || generateTitle({packageJson})}`,
        generateDescription({packageJson}),
        preamble,
        generateInstallationInstructions({packageJson}),
        `## Usage`
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
