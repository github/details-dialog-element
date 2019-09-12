export default class DetailsDialogElement extends HTMLElement {
  toggle(open: boolean): void;
}

declare global {
  interface Window {
    DetailsDialogElement: DetailsDialogElement
  }
}
