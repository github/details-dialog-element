# &lt;details-dialog&gt; element

A modal dialog that's opened with a &lt;details&gt; button.

## Installation

```
$ npm install --save @github/details-dialog-element
```

## Usage

### Script

Import as ES modules:

```js
import '@github/details-dialog-element'
```

Include with a script tag:

```html
<script type="module" src="./node_modules/@github/details-dialog-element/dist/index.js">
```

### Markup

```html
<details>
  <summary>Open dialog</summary>
  <details-dialog>
    Modal content
    <button type="button" data-close-dialog>Close</button>
  </details-dialog>
</details>
```

## Deferred loading

Dialog content can be loaded from a server by embedding an [`<include-fragment>`][fragment] element.

```html
<details>
  <summary>Robots</summary>
  <details-dialog src="/robots" preload>
    <include-fragment>Loading…</include-fragment>
  </details-dialog>
</details>
```

The `src` attribute value is copied to the `<include-fragment>` the first time the `<details>` button is toggled open, which starts the server fetch.

If the `preload` attribute is present, hovering over the `<details>` element will trigger the server fetch.

## Events

### `details-dialog-close`

`details-dialog-close` event is fired from `<details-dialog>` when a request to close the dialog is made from

- pressing <kbd>escape</kbd>,
- clicking on `summary, [data-close-dialog]`, or
- `dialog.toggle(false)`

This event bubbles, and can be canceled to keep the dialog open.

```js
document.addEventListener('details-dialog-close', function(event) {
  if (!confirm('Are you sure?')) {
    event.preventDefault()
  }
})
```

## Browser support

Browsers without native [custom element support][support] require a [polyfill][].

- Chrome
- Firefox
- Safari
- Microsoft Edge

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.

[fragment]: https://github.com/github/include-fragment-element/
[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/custom-elements
