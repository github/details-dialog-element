class DetailsDialogElement extends HTMLElement {
  constructor() {
    super()
    this._createCloseButton()
    this.details = this.parentElement
    this.setAttribute('role', 'dialog')

    const keyDownHelpers = this._keyDownHelpers.bind(this)
    const captureDismissal = this._captureDismissal.bind(this)

    this.details.addEventListener(
      'toggle',
      function() {
        if (this.details.open) {
          this._autofocus()
          this.details.addEventListener('keydown', keyDownHelpers)
          this.addEventListener('click', captureDismissal)
        } else {
          const summary = this.details.querySelector('summary')
          summary.focus()

          this.details.removeEventListener('keydown', keyDownHelpers)
          this.removeEventListener('click', captureDismissal)
        }
      }.bind(this),
      {capture: true}
    )
  }

  _createCloseButton() {
    this.closeButton = document.createElement('button')
    this.closeButton.innerHTML = '&#9587;'
    this.closeButton.classList.add('dd-close-button')
    this.closeButton.setAttribute('type', 'button')
    this.closeButton.setAttribute('aria-label', 'Close dialog')
    this.closeButton.setAttribute('data-close-dialog', true)
    this.appendChild(this.closeButton)
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
      return !element.disabled && element.offsetWidth > 0 && element.offsetHeight > 0
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
