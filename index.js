const tmpl = document.createElement('template')
tmpl.innerHTML = `
  <style>
    .close-button {
      background: none;
      position: absolute;
      right: 0;
      top: 0;
      padding: 20px;
      border: 0;
      line-height: 1;
    }
  </style>
  <slot></slot>
  <button type="button" class="close-button" aria-label="Close dialog" data-close-dialog>&#9587;</button>
`
if (window.ShadyCSS) window.ShadyCSS.prepareTemplate(tmpl, 'details-dialog')

class DetailsDialogElement extends HTMLElement {
  constructor() {
    super()

    if (window.ShadyCSS) window.ShadyCSS.styleElement(this)
    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(document.importNode(tmpl.content, true))

    this.details = this.parentElement
    this.closeButton = this.shadowRoot.querySelector('.close-button')
    this.setAttribute('role', 'dialog')

    const keyDownHelpers = this._keyDownHelpers.bind(this)
    const captureDismissal = this._captureDismissal.bind(this)

    this.details.addEventListener(
      'toggle',
      function() {
        if (this.details.open) {
          this._autofocus()
          this.details.addEventListener('keydown', keyDownHelpers)
          this.shadowRoot.addEventListener('click', captureDismissal)
        } else {
          const summary = this.details.querySelector('summary')
          summary.focus()

          this.details.removeEventListener('keydown', keyDownHelpers)
          this.shadowRoot.removeEventListener('click', captureDismissal)
        }
      }.bind(this),
      {capture: true}
    )
  }

  _autofocus() {
    let autofocus = this.querySelector('[autofocus]')
    if (!autofocus) {
      autofocus = this
      this.setAttribute('tabindex', '-1')
    }
    autofocus.focus()
  }

  _captureDismissal(event) {
    if (event.target.hasAttribute('data-close-dialog')) {
      this.details.open = false
    }
  }

  _keyDownHelpers(event) {
    if (event.key === 'Escape') {
      event.currentTarget.open = false
    } else if (event.key === 'Tab') {
      this._restrictTabBehavior(event)
    }
  }

  _restrictTabBehavior(event) {
    event.preventDefault()

    const modal = event.currentTarget
    const elements = Array.from(modal.querySelectorAll('a, input, button, textarea')).filter(function(element) {
      return !element.disabled || (element.offsetWidth > 0 && element.offsetHeight > 0)
    })

    elements.unshift(this.closeButton)
    const movement = event.shiftKey ? -1 : 1
    const currentFocus = elements.filter(el => el.matches(':focus'))[0]
    let targetIndex = elements.length - 1

    if (currentFocus) {
      const currentIndex = elements.indexOf(currentFocus)
      if (currentIndex !== -1) {
        const newIndex = currentIndex + movement
        if (newIndex >= 0) targetIndex = newIndex % elements.length
      }
    }

    elements[targetIndex].focus()
  }
}

window.customElements.define('details-dialog', DetailsDialogElement)
