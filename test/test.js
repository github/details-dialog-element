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
    let details
    let dialog
    let summary
    let close

    beforeEach(function() {
      const container = document.createElement('div')
      container.innerHTML = `
        <details>
          <summary>Click</summary>
          <details-dialog>
            <p>Hello</p>
            <button data-button>Button</button>
            <button hidden>hidden</button>
            <div hidden><button>hidden</button></div>
            <details><button>Button in closed details</button></details>
            <button ${CLOSE_ATTR}>Goodbye</button>
          </details-dialog>
        </details>
      `
      document.body.append(container)

      details = document.querySelector('details')
      dialog = details.querySelector('details-dialog')
      summary = details.querySelector('summary')
      close = dialog.querySelector(CLOSE_SELECTOR)
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('initializes', function() {
      assert.equal(summary.getAttribute('role'), 'button')
      assert.equal(dialog.getAttribute('role'), 'dialog')
      assert.equal(dialog.getAttribute('aria-modal'), 'true')
    })

    it('toggles open', function() {
      assert(!details.open)
      dialog.toggle(true)
      assert(details.open)
      dialog.toggle(false)
      assert(!details.open)
    })

    it('closes with close button', function() {
      assert(!details.open)
      dialog.toggle(true)
      assert(details.open)
      close.click()
      assert(!details.open)
    })

    it('closes when summary is clicked', function() {
      assert(!details.open)
      dialog.toggle(true)
      assert(details.open)
      summary.click()
      assert(!details.open)
    })

    it('closes when escape key is pressed', async function() {
      assert(!details.open)
      dialog.toggle(true)
      await waitForToggleEvent(details)
      assert(details.open)
      triggerKeydownEvent(details, 'Escape')
      assert(!details.open)
    })

    it('manages focus', async function() {
      summary.click()
      await waitForToggleEvent(details)
      assert.equal(document.activeElement, dialog)
      triggerKeydownEvent(details, 'Tab', true)
      assert.equal(document.activeElement, document.querySelector(`[${CLOSE_ATTR}]`))
      triggerKeydownEvent(details, 'Tab')
      assert.equal(document.activeElement, document.querySelector(`[data-button]`))
      triggerKeydownEvent(details, 'Tab')
      assert.equal(document.activeElement, document.querySelector(`[${CLOSE_ATTR}]`))
    })

    it('supports a cancellable details-dialog-close event when a summary element is present', async function() {
      dialog.toggle(true)
      await waitForToggleEvent(details)
      assert(details.open)

      let closeRequestCount = 0
      let allowCloseToHappen = false
      dialog.addEventListener(
        'details-dialog-close',
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
      assert.equal(closeRequestCount, 1)

      summary.click()
      assert(details.open)
      assert.equal(closeRequestCount, 2)

      triggerKeydownEvent(details, 'Escape')
      assert(details.open)
      assert.equal(closeRequestCount, 3)

      dialog.toggle(false)
      assert(details.open)
      assert.equal(closeRequestCount, 4)

      allowCloseToHappen = true
      close.click()
      assert(!details.open)
    })

    describe('when no summary element is present', function() {
      beforeEach(function() {
        summary.remove()
      })

      it('supports a cancellable details-dialog-close event', async function() {
        dialog.toggle(true)
        await waitForToggleEvent(details)
        assert(details.open)

        let closeRequestCount = 0
        let allowCloseToHappen = false
        dialog.addEventListener(
          'details-dialog-close',
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
        assert.equal(closeRequestCount, 1)

        triggerKeydownEvent(details, 'Escape')
        assert(details.open)
        assert.equal(closeRequestCount, 2)

        dialog.toggle(false)
        assert(details.open)
        assert.equal(closeRequestCount, 3)

        allowCloseToHappen = true
        close.click()
        assert(!details.open)
      })

      it('toggles open', function() {
        assert(!details.open)
        dialog.toggle(true)
        assert(details.open)
        dialog.toggle(false)
        assert(!details.open)
      })

      it('closes with close button', function() {
        assert(!details.open)
        dialog.toggle(true)
        assert(details.open)
        close.click()
        assert(!details.open)
      })

      it('closes when escape key is pressed', async function() {
        assert(!details.open)
        dialog.toggle(true)
        await waitForToggleEvent(details)
        assert(details.open)
        triggerKeydownEvent(details, 'Escape')
        assert(!details.open)
      })
    })

    describe('when using with inlcude-fragment', function() {
      let includeFragment
      beforeEach(function() {
        includeFragment = document.createElement('include-fragment')
        dialog.innerHTML = ''
        dialog.append(includeFragment)
        dialog.src = '/404'
      })

      afterEach(function() {
        dialog.innerHTML = ''
        dialog.removeAttribute('src')
      })

      it('transfers src on toggle', async function() {
        assert(!details.open)
        assert.notOk(includeFragment.getAttribute('src'))
        dialog.toggle(true)
        await waitForToggleEvent(details)
        assert(details.open)
        assert.equal(includeFragment.getAttribute('src'), '/404')
      })

      it('transfers src on mouseover when preload is true', async function() {
        assert(!details.open)
        dialog.preload = true
        assert(dialog.hasAttribute('preload'))
        assert.notOk(includeFragment.getAttribute('src'))
        triggerMouseoverEvent(details)
        assert.equal(includeFragment.getAttribute('src'), '/404')
      })
    })

    describe('with inlcude-fragment works for script made dialogs', function() {
      let includeFragment
      beforeEach(function() {
        dialog.remove()
        dialog = document.createElement('details-dialog')
        dialog.src = '/404'
        dialog.preload = true
        includeFragment = document.createElement('include-fragment')
        dialog.append(includeFragment)
        details.append(dialog)
        includeFragment = document.querySelector('include-fragment')
      })

      it('transfers src on toggle', async function() {
        assert(!details.open)
        assert.notOk(includeFragment.getAttribute('src'))
        dialog.toggle(true)
        await waitForToggleEvent(details)
        assert(details.open)
        assert.equal(includeFragment.getAttribute('src'), '/404')
      })

      it('transfers src on mouseover', async function() {
        assert(!details.open)
        assert.notOk(includeFragment.getAttribute('src'))
        triggerMouseoverEvent(details)
        assert.equal(includeFragment.getAttribute('src'), '/404')
      })
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

function triggerMouseoverEvent(element) {
  element.dispatchEvent(
    new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true
    })
  )
}
function triggerKeydownEvent(element, key, shiftKey) {
  element.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key,
      shiftKey
    })
  )
}
