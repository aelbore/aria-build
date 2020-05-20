import * as sinon from 'sinon'

import { expect } from 'aria-mocha'
import { onwarn } from './base-config'

describe('base-config', () => {

  afterEach(() => {
    sinon.restore()
  })

  it('should have no warning message', () => {
    const logSpy = sinon.spy(console, 'log')

    onwarn({ code: 'THIS_IS_UNDEFINED', message: 'Message Here' })

    expect(logSpy.called).toBeFalse()
  })

  it('should have no warning message', () => {
    const logStub = sinon.stub(console, 'log').returns(null)

    onwarn({ code: 'Error', message: 'Message Here' })

    expect(logStub.called).toBeTrue()
  })

})