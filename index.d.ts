export default class DetailsDialogElement extends HTMLElement {
  toggle(open: boolean): void;
}

declare global {
  interface Window {
    DetailsDialogElement: typeof DetailsDialogElement
  }
  interface HTMLElementTagNameMap {
    'details-dialog': DetailsDialogElement
  }
}