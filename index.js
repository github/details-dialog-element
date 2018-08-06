const CLOSE_ATTR = 'data-close-dialog'
const CLOSE_SELECTOR = `[${CLOSE_ATTR}]`
const INPUT_SELECTOR = 'a, input, button, textarea, select, summary'

function autofocus(el) {
  let autofocus = el.querySelector('[autofocus]')
  if (!autofocus) {
    autofocus = el
    el.setAttribute('tabindex', '-1')
  }
  autofocus.focus()
}

function keydown(event) {
  if (event.key === 'Escape') {
    event.currentTarget.open = false
    event.stopPropagation()
  } else if (event.key === 'Tab') {
    restrictTabBehavior(event)
  }
}

function focusable(el) {
  return !el.disabled && !el.hidden && el.type !== 'hidden'
}

function restrictTabBehavior(event) {
  const dialog = event.currentTarget.querySelector('details-dialog')
  if (!dialog) return
  event.preventDefault()

  const elements = Array.from(dialog.querySelectorAll(INPUT_SELECTOR)).filter(focusable)

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

function toggle(event) {
  const details = event.currentTarget
  const dialog = details.querySelector('details-dialog')

  if (details.open) {
    if (document.activeElement) {
      initialized.set(dialog, {details, activeElement: document.activeElement})
    }

    autofocus(dialog)
    details.addEventListener('keydown', keydown)
  } else {
    for (const form of dialog.querySelectorAll('form')) {
      form.reset()
    }
    const {activeElement} = initialized.get(dialog)
    if (activeElement) activeElement.focus()
    details.removeEventListener('keydown', keydown)
  }
}

const initialized = new WeakMap()

class DetailsDialogElement extends HTMLElement {
  static get CLOSE_ATTR() {
    return CLOSE_ATTR
  }
  static get CLOSE_SELECTOR() {
    return CLOSE_SELECTOR
  }
  static get INPUT_SELECTOR() {
    return INPUT_SELECTOR
  }

  constructor() {
    super()
    initialized.set(this, {details: null})
    this.addEventListener('click', event => {
      if (event.target.closest(CLOSE_SELECTOR)) {
        event.target.closest('details').open = false
      }
    })
  }

  connectedCallback() {
    this.setAttribute('role', 'dialog')
    const state = initialized.get(this)
    const details = this.parentElement
    if (!details) return

    const summary = details.querySelector('summary')
    if (summary) summary.setAttribute('aria-haspopup', 'dialog')

    details.addEventListener('toggle', toggle)
    state.details = details
  }

  disconnectedCallback() {
    const state = initialized.get(this)
    state.details.removeEventListener('toggle', toggle)
    state.details = null
  }

  toggle(open) {
    const {details} = initialized.get(this)
    if (details) {
      open ? details.setAttribute('open', true) : details.removeAttribute('open')
    }
  }
}

export default DetailsDialogElement

if (!window.customElements.get('details-dialog')) {
  window.DetailsDialogElement = DetailsDialogElement
  window.customElements.define('details-dialog', DetailsDialogElement)
}
