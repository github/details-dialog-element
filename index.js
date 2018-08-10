/* @flow strict */

const CLOSE_ATTR = 'data-close-dialog'
const CLOSE_SELECTOR = `[${CLOSE_ATTR}]`
const INPUT_SELECTOR = 'a, input, button, textarea, select, summary'

function autofocus(el: DetailsDialogElement) {
  let autofocus = el.querySelector('[autofocus]')
  if (!autofocus) {
    autofocus = el
    el.setAttribute('tabindex', '-1')
  }
  autofocus.focus()
}

function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    ;(event.currentTarget: any).open = false
    event.stopPropagation()
  } else if (event.key === 'Tab') {
    restrictTabBehavior(event)
  }
}

function focusable(el: any): boolean {
  return !el.disabled && !el.hidden && el.type !== 'hidden'
}

function restrictTabBehavior(event: KeyboardEvent) {
  if (!(event.currentTarget instanceof Element)) return
  const dialog = event.currentTarget.querySelector('details-dialog')
  if (!dialog) return
  event.preventDefault()

  const elements: Array<Element> = Array.from(dialog.querySelectorAll(INPUT_SELECTOR)).filter(focusable)

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

  ;(elements[targetIndex]: any).focus()
}

function toggle(event: Event) {
  const details: any = event.currentTarget
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
    const state = initialized.get(dialog)
    const focusElement: any =
      state && state.activeElement && state.activeElement !== document.body
        ? state.activeElement
        : details.querySelector('summary')
    if (focusElement) focusElement.focus()
    details.removeEventListener('keydown', keydown)
  }
}

type State = {|
  details: ?Element,
  activeElement: ?Element
|}

const initialized: WeakMap<Element, State> = new WeakMap()

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
    initialized.set(this, {details: null, activeElement: null})
    this.addEventListener('click', function({target}: Event) {
      if (!(target instanceof Element)) return
      if (target.closest(CLOSE_SELECTOR)) {
        ;(target.closest('details'): any).open = false
      }
    })
  }

  connectedCallback() {
    this.setAttribute('role', 'dialog')
    const state = initialized.get(this)
    if (!state) return
    const details = this.parentElement
    if (!details) return

    const summary = details.querySelector('summary')
    if (summary) summary.setAttribute('aria-haspopup', 'dialog')

    details.addEventListener('toggle', toggle)
    state.details = details
  }

  disconnectedCallback() {
    const state = initialized.get(this)
    if (!state || !state.details) return
    state.details.removeEventListener('toggle', toggle)
    state.details = null
  }

  toggle(open: boolean) {
    const state = initialized.get(this)
    if (!state) return
    const {details} = state
    if (!details) return
    ;(details: any).open = open
  }
}

export default DetailsDialogElement

if (!window.customElements.get('details-dialog')) {
  window.DetailsDialogElement = DetailsDialogElement
  window.customElements.define('details-dialog', DetailsDialogElement)
}
