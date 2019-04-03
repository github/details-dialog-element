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
  if (event.key === 'Escape' || event.key === 'Esc') {
    toggleDetails(details, false)
    event.stopPropagation()
  } else if (event.key === 'Tab') {
    restrictTabBehavior(event)
  }
}

function focusable(el: Focusable): boolean {
  return !el.disabled && !el.hidden && (!el.type || el.type !== 'hidden') && !el.closest('[hidden]')
}

function restrictTabBehavior(event: KeyboardEvent): void {
  if (!(event.currentTarget instanceof Element)) return
  const dialog = event.currentTarget.querySelector('details-dialog')
  if (!dialog) return
  event.preventDefault()

  const elements: Array<Focusable> = Array.from(dialog.querySelectorAll(INPUT_SELECTOR)).filter(focusable)
  if (elements.length === 0) return

  const movement = event.shiftKey ? -1 : 1
  const currentFocus = elements.filter(el => el.matches(':focus'))[0]
  let targetIndex = 0

  if (currentFocus) {
    const currentIndex = elements.indexOf(currentFocus)
    if (currentIndex !== -1) {
      const newIndex = currentIndex + movement
      if (newIndex >= 0) targetIndex = newIndex % elements.length
    }
  }

  elements[targetIndex].focus()
}

function allowClosingDialog(details: Element): boolean {
  const dialog = details.querySelector('details-dialog')
  if (!(dialog instanceof DetailsDialogElement)) return true

  return dialog.dispatchEvent(
    new CustomEvent('details-dialog:will-close', {
      bubbles: true,
      cancelable: true
    })
  )
}

function onSummaryClick(event: Event): void {
  if (!(event.currentTarget instanceof Element)) return
  const details = event.currentTarget.closest('details[open]')
  if (!details) return

  // Prevent summary click events if details-dialog:will-close was cancelled
  if (!allowClosingDialog(details)) {
    event.preventDefault()
    event.stopPropagation()
  }
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
    const focusElement = findFocusElement(details, dialog)
    if (focusElement) focusElement.focus()
    details.removeEventListener('keydown', keydown)
  }
}

function findFocusElement(details: Element, dialog: DetailsDialogElement): ?HTMLElement {
  const state = initialized.get(dialog)
  if (state && state.activeElement instanceof HTMLElement) {
    return state.activeElement
  } else {
    return details.querySelector('summary')
  }
}

function toggleDetails(details: Element, open: boolean) {
  // Don't update unless state is changing
  if (open === details.hasAttribute('open')) return

  if (open) {
    details.setAttribute('open', '')
  } else if (allowClosingDialog(details)) {
    details.removeAttribute('open')
  }
}

function loadIncludeFragment(event: Event) {
  const details = event.currentTarget
  if (!(details instanceof Element)) return
  const dialog = details.querySelector('details-dialog')
  if (!(dialog instanceof DetailsDialogElement)) return

  if (!dialog.src) return
  if (dialog.loading || dialog.loaded) return

  const loader: any = dialog.querySelector('include-fragment')
  if (loader) {
    dialog.setAttribute('loading', '')
    loader.addEventListener('loadend', () => {
      dialog.setAttribute('loaded', '')
      dialog.removeAttribute('loading')
      autofocus(dialog)
    })
    loader.src = dialog.src
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
        toggleDetails(details, false)
      }
    })
  }

  get src(): ?string {
    return this.getAttribute('src')
  }

  set src(value: string) {
    value ? this.setAttribute('src', value) : this.removeAttribute('src')
  }

  get preload(): boolean {
    return this.hasAttribute('preload')
  }

  set preload(value: boolean) {
    value ? this.setAttribute('preload', '') : this.removeAttribute('preload')
  }

  get loaded(): boolean {
    return this.hasAttribute('loaded')
  }

  get loading(): boolean {
    return this.hasAttribute('loading')
  }

  connectedCallback() {
    this.setAttribute('role', 'dialog')
    const state = initialized.get(this)
    if (!state) return
    const details = this.parentElement
    if (!details) return

    const summary = details.querySelector('summary')
    if (summary) {
      summary.setAttribute('aria-haspopup', 'dialog')
      summary.addEventListener('click', onSummaryClick, {capture: true})
    }

    details.addEventListener('toggle', toggle)
    state.details = details
  }

  disconnectedCallback() {
    const state = initialized.get(this)
    if (!state) return
    const {details} = state
    if (!details) return
    details.removeEventListener('toggle', toggle)
    const summary = details.querySelector('summary')
    if (summary) {
      summary.removeEventListener('click', onSummaryClick, {capture: true})
    }
    state.details = null
  }

  toggle(open: boolean): void {
    const state = initialized.get(this)
    if (!state) return
    const {details} = state
    if (!details) return
    toggleDetails(details, open)
  }

  static get observedAttributes() {
    return ['src', 'preload']
  }

  attributeChangedCallback(attribute: string) {
    const details = this.parentElement
    if (!details) return

    if (attribute === 'src') {
      this.removeAttribute('loaded')
    }

    if (this.src) {
      details.addEventListener('toggle', loadIncludeFragment, {once: true})

      if (this.preload) {
        details.addEventListener('mouseover', loadIncludeFragment, {once: true})
      }
    } else {
      details.removeEventListener('toggle', loadIncludeFragment)
      details.removeEventListener('mouseover', loadIncludeFragment)
    }
  }
}

export default DetailsDialogElement

if (!window.customElements.get('details-dialog')) {
  window.DetailsDialogElement = DetailsDialogElement
  window.customElements.define('details-dialog', DetailsDialogElement)
}
