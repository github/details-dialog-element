# &lt;details-dialog&gt; element

A modal dialog that's opened with a &lt;details&gt; button.

## Installation

```
$ npm install --save details-dialog-element
```

## Usage

```js
import 'details-dialog-element'
```

```html
<details>
  <summary>Open dialog</summary>
  <details-dialog>
    Modal content
    <button type="button" data-close-dialog>Close</button>
  </details-dialog>
</details>
```

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

[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/custom-elements

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
