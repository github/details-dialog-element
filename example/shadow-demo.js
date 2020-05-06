class ShadowDialog extends HTMLElement {
  constructor() {
    super()
    const root = this.attachShadow({mode: 'open'})
    root.innerHTML = `
      <style>
        details {
          margin-top: 2em;
        }
        summary {
          padding: .5em;
          border: 1px solid;
          border-radius: .3em;
          display: inline-block;
        }
        details[open] summary:before {
          position: fixed;
          content: '';
          display: block;
          left: 0;
          right: 0;
          bottom: 0;
          top: 0;
          background: rgba(0, 0, 0, 0.3);
        }
        details-dialog {
          position: fixed;
          height: 50vh;
          top: 50%;
          margin-top: -25vh;
          width: 50vw;
          min-width: 20em;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border-radius: .5em;
          padding: 1em;
        }
      </style>
      <details>
        <summary>Dialog with Shadow DOM</summary>
        <details-dialog aria-label="Shadow dialog">
          <button type="button" data-close-dialog>Close</button>
          content
          <button type="button" data-close-dialog>Close</button>
        </details-dialog>
      </details>`
  }
}

window.customElements.define('shadow-dialog', ShadowDialog)
