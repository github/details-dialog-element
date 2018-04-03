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
        </details-dialog>
      </details>`
      document.body.append(container)
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('creates a close button', function() {
      assert(document.querySelector('details-dialog button[data-close-dialog]'))
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
  })
})