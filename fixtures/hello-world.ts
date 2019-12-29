class HelloWorld extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return [ 'message' ]
  }

  connectedCallback() {
    for (const prop of (this.constructor as any).observedAttributes) {
      if (this.hasAttribute(prop)) {
        this[prop] = this.getAttribute(prop)
      }
    }
    this.render()
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: string) {
    if (oldValue !== newValue) {
      this.render()
    }
  }

  get message() {
    return this.getAttribute('message')
  }

  set message(value: string) {
    this.setAttribute('message', value)
  }

  render() {
    this.shadowRoot.innerHTML = `
      <h1>Hello ${this.message}</h1>
    `
  }

}

customElements.define('hello-world', HelloWorld)