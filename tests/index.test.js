import { describe, expect, test } from '@jest/globals'

import * as wdkWallet from '@tetherto/wdk-wallet'

import * as root from '../index.js'

describe('index', () => {
  test.each([
    'DisposalError',
    'InvalidSignerError',
    'NoSuchElementError',
    'NotImplementedError',
    'UnsupportedOperationError',
    'ValueError',
    'WdkError'
  ])('should re-export %s from @tetherto/wdk-wallet', (name) => {
    expect(root[name]).toBe(wdkWallet[name])
  })
})
