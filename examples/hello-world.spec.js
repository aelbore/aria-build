import './hello-world'

describe('HelloWorld', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('hello-world')
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('should have element', () => {
    expect(element).toBeDefined()
  })

  it('should have shadowRoot.', () => {
    expect(element.shadowRoot).toBeDefined()
  })

  it('should have styles static get accessor', () => {
    const style = element.shadowRoot.querySelector('style');
    
    expect(style).toBeDefined()
  })

})