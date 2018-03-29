function createCloseButton() {
  const button = document.createElement('button')
  button.innerHTML = closeIcon()
  button.classList.add('dd-close-button')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'Close dialog')
  button.setAttribute('data-close-dialog', true)
  return button
}

function autofocus(el) {
  let autofocus = el.querySelector('[autofocus]')
  if (!autofocus) {
    autofocus = el
    el.setAttribute('tabindex', '-1')
  }
  autofocus.focus()
}

function captureDismissal(event) {
  if (event.target.hasAttribute('data-close-dialog') || event.target.closest('[data-close-dialog]')) {
    event.target.closest('details').open = false
  }
}

function keydown(event) {
  if (event.key === 'Escape') {
    event.currentTarget.open = false
  } else if (event.key === 'Tab') {
    restrictTabBehavior(event)
  }
}

function restrictTabBehavior(event) {
  event.preventDefault()

  const dialog = event.currentTarget
  const elements = Array.from(dialog.querySelectorAll('a, input, button, textarea')).filter(
    el => !el.disabled && !el.hidden && el.type !== 'hidden'
  )

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
function closeIcon() {
  return '<svg version="1.1" width="12" height="16" viewBox="0 0 12 16" aria-hidden="true"><path d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"/></svg>'
}

class DetailsDialogElement extends HTMLElement {
  connectedCallback() {
    this.closeButton = createCloseButton()
    this.appendChild(this.closeButton)
    this.details = this.parentElement
    this.setAttribute('role', 'dialog')

    this.details.addEventListener(
      'toggle',
      () => {
        if (this.details.open) {
          autofocus(this)
          this.details.addEventListener('keydown', keydown)
          this.addEventListener('click', captureDismissal)
        } else {
          for (const form of this.querySelectorAll('form')) {
            form.reset()
          }
          this.details.querySelector('summary').focus()
          this.details.removeEventListener('keydown', keydown)
          this.removeEventListener('click', captureDismissal)
        }
      },
      {capture: true}
    )
  }

  toggle(open) {
    open ? this.details.setAttribute('open', true) : this.details.removeAttribute('open')
  }
}

if (!window.customElements.get('details-dialog')) {
  window.DetailsDialogElement = DetailsDialogElement
  window.customElements.define('details-dialog', DetailsDialogElement)
}
