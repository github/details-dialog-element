const {CLOSE_ATTR, CLOSE_SELECTOR} = window.DetailsDialogElement

describe('details-dialog-element', function() {
  describe('element creation', function() {
    it('creates from document.createElement', function() {
      const el = document.createElement('details-dialog')
      assert.equal('DETAILS-DIALOG', el.nodeName)
    })

    it('creates from constructor', function() {
      const el = new window.DetailsDialogElement()
      assert.equal('DETAILS-DIALOG', el.nodeName)
    })
  })

  describe('after tree insertion', function() {
    beforeEach(function() {
      const container = document.createElement('div')
      container.innerHTML = `
        <details>
          <summary>Click</summary>
          <details-dialog>
            <p>Hello</p>
            <button ${CLOSE_ATTR}>Goodbye</button>
          </details-dialog>
        </details>
      `
      document.body.append(container)
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('toggles open', function() {
      const details = document.querySelector('details')
      const dialog = details.querySelector('details-dialog')
      assert(!details.open)
      dialog.toggle(true)
      assert(details.open)
      dialog.toggle(false)
      assert(!details.open)
    })

    it('closes with close button', function() {
      const details = document.querySelector('details')
      const dialog = details.querySelector('details-dialog')
      const close = dialog.querySelector(CLOSE_SELECTOR)
      assert(!details.open)
      dialog.toggle(true)
      assert(details.open)
      close.click()
      assert(!details.open)
    })

    it('closes when summary is clicked', function() {
      const details = document.querySelector('details')
      const summary = document.querySelector('summary')
      const dialog = details.querySelector('details-dialog')
      assert(!details.open)
      dialog.toggle(true)
      assert(details.open)
      summary.click()
      assert(!details.open)
    })

    it('closes when escape key is pressed', async function() {
      const details = document.querySelector('details')
      const dialog = details.querySelector('details-dialog')
      assert(!details.open)
      dialog.toggle(true)
      await waitForToggleEvent(details)
      assert(details.open)
      const escapeEvent = document.createEvent('Event')
      escapeEvent.initEvent('keydown', true, true)
      escapeEvent.key = 'Escape'
      details.dispatchEvent(escapeEvent)
      assert(!details.open)
    })

    it('supports canceling requests to close the dialog', async function() {
      const details = document.querySelector('details')
      const summary = document.querySelector('summary')
      const dialog = details.querySelector('details-dialog')
      const close = dialog.querySelector(CLOSE_SELECTOR)

      dialog.toggle(true)
      await waitForToggleEvent(details)
      assert(details.open)

      let closeRequestCount = 0
      let allowCloseToHappen = false
      summary.addEventListener(
        'click',
        function(event) {
          closeRequestCount++
          if (!allowCloseToHappen) {
            event.preventDefault()
            event.stopPropagation()
          }
        },
        {capture: true}
      )

      close.click()
      assert(details.open)
      assert.equal(1, closeRequestCount)

      summary.click()
      assert(details.open)
      assert.equal(2, closeRequestCount)

      const escapeEvent = document.createEvent('Event')
      escapeEvent.initEvent('keydown', true, true)
      escapeEvent.key = 'Escape'
      details.dispatchEvent(escapeEvent)
      assert(details.open)
      assert.equal(3, closeRequestCount)

      allowCloseToHappen = true
      close.click()
      assert(!details.open)
    })
  })
})

function waitForToggleEvent(details) {
  return new Promise(function(resolve) {
    details.addEventListener(
      'toggle',
      function() {
        resolve()
      },
      {once: true}
    )
  })
}
