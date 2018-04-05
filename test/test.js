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

    xit('renders a single close button', function() {
      const details = document.querySelector('details')
      const dialog = details.querySelector('details-dialog')
      assert.equal(1, dialog.querySelectorAll(CLOSE_SELECTOR).length)
      dialog.remove()
      details.append(dialog)
      assert.equal(1, dialog.querySelectorAll(CLOSE_SELECTOR).length)
    })
  })

  xdescribe('custom close button', function() {
    let customButton

    beforeEach(function() {
      const container = document.createElement('div')
      container.innerHTML = `
        <details>
          <summary>Click</summary>
          <details-dialog>
            <p>Hello</p>
            <button ${CLOSE_ATTR}>Say goodbye</button>
          </details-dialog>
        </details>
      `
      customButton = container.querySelector(CLOSE_SELECTOR)
      document.body.append(container)
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('creates a close button', function() {
      const buttons = document.querySelectorAll(CLOSE_SELECTOR)
      const [firstButton] = buttons
      assert.equal(buttons.length, 1, `More than one button (${buttons.length})`)
      assert.strictEqual(firstButton, customButton, `Wrong button: ${firstButton.outerHTML}`)
    })
  })
})
