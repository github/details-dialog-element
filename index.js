/* @flow strict */

const CLOSE_ATTR = 'data-close-dialog'
const CLOSE_SELECTOR = `[${CLOSE_ATTR}]`
const INPUT_SELECTOR = 'a, input, button, textarea, select, summary'

type Focusable =
  | HTMLButtonElement
  | HTMLInputElement
  | HTMLAnchorElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLElement

function autofocus(el: DetailsDialogElement): void {
  let autofocus = el.querySelector('[autofocus]')
  if (!autofocus) {
    autofocus = el
    el.setAttribute('tabindex', '-1')
  }
  autofocus.focus()
}

function keydown(event: KeyboardEvent): void {
  const details = event.currentTarget
  if (!(details instanceof Element)) return
  if (event.key === 'Escape') {
    details.removeAttribute('open')
    event.stopPropagation()
  } else if (event.key === 'Tab') {
    restrictTabBehavior(event)
  }
}

function focusable(el: Focusable): boolean {
  return !el.disabled && !el.hidden && (!el.type || el.type !== 'hidden')
}

function restrictTabBehavior(event: KeyboardEvent): void {
  if (!(event.currentTarget instanceof Element)) return
  const dialog = event.currentTarget.querySelector('details-dialog')
  if (!dialog) return
  event.preventDefault()

  const elements: Array<Focusable> = Array.from(dialog.querySelectorAll(INPUT_SELECTOR)).filter(focusable)

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

function toggle(event: Event): void {
  const details = event.currentTarget
  if (!(details instanceof Element)) return
  const dialog = details.querySelector('details-dialog')
  if (!(dialog instanceof DetailsDialogElement)) return

  if (details.hasAttribute('open')) {
    if (document.activeElement) {
      initialized.set(dialog, {details, activeElement: document.activeElement})
    }

    autofocus(dialog)
    details.addEventListener('keydown', keydown)
  } else {
    for (const form of dialog.querySelectorAll('form')) {
      if (form instanceof HTMLFormElement) form.reset()
    }
    const state = initialized.get(dialog)
    const focusElement: ?HTMLElement =
      state && state.activeElement instanceof HTMLElement && state.activeElement !== document.body
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
      const details = target.closest('details')
      if (details && target.closest(CLOSE_SELECTOR)) {
        details.removeAttribute('open')
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

  toggle(open: boolean): void {
    const state = initialized.get(this)
    if (!state) return
    const {details} = state
    if (!details) return
    open ? details.setAttribute('open', 'open') : details.removeAttribute('open')
  }
}

export default DetailsDialogElement

if (!window.customElements.get('details-dialog')) {
  window.DetailsDialogElement = DetailsDialogElement
  window.customElements.define('details-dialog', DetailsDialogElement)
}
