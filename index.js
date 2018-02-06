class DetailsDialogElement extends HTMLElement {
  constructor() {
    super()
    this.createCloseButton()
    this.details = this.parentElement
    this.setAttribute('role', 'dialog')

    const keyDownHelpers = this.keyDownHelpers.bind(this)
    const captureDismissal = this.captureDismissal.bind(this)

    this.details.addEventListener(
      'toggle',
      function() {
        if (this.details.open) {
          this.autofocus()
          this.details.addEventListener('keydown', keyDownHelpers)
          this.addEventListener('click', captureDismissal)
        } else {
          for (const form of this.querySelectorAll('form')) {
            form.reset()
          }

          const summary = this.details.querySelector('summary')
          summary.focus()

          this.details.removeEventListener('keydown', keyDownHelpers)
          this.removeEventListener('click', captureDismissal)
        }
      }.bind(this),
      {capture: true}
    )
  }

  createCloseButton() {
    this.closeButton = document.createElement('button')
    this.closeButton.innerHTML = this.closeIcon()
    this.closeButton.classList.add('dd-close-button')
    this.closeButton.setAttribute('type', 'button')
    this.closeButton.setAttribute('aria-label', 'Close dialog')
    this.closeButton.setAttribute('data-close-dialog', true)
    this.appendChild(this.closeButton)
  }

  autofocus() {
    let autofocus = this.querySelector('[autofocus]')
    if (!autofocus) {
      autofocus = this
      this.setAttribute('tabindex', '-1')
    }
    autofocus.focus()
  }

  captureDismissal(event) {
    if (event.target.hasAttribute('data-close-dialog')) {
      this.details.open = false
    }
  }

  keyDownHelpers(event) {
    if (event.key === 'Escape') {
      event.currentTarget.open = false
    } else if (event.key === 'Tab') {
      this.restrictTabBehavior(event)
    }
  }

  restrictTabBehavior(event) {
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

  // Pulled from https://github.com/primer/octicons
  // We're only using one octicon so it doesn't make sense to include the whole module
  closeIcon() {
    return '<svg version="1.1" width="12" height="16" viewBox="0 0 12 16" aria-hidden="true"><path d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"/></svg>'
  }
}

window.customElements.define('details-dialog', DetailsDialogElement)
