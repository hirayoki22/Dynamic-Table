export class SColumn extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    
  }

  render() {

  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback() {

  }

  disconnectedCallback() {
    
  }
}

customElements.define('super-col', SColumn);
