import { describe, expect, test } from '@jest/globals'

import { NotImplementedError } from '@tetherto/wdk-wallet'

import { ISignerTron } from '../../src/signers/signer-tron.js'

describe('ISignerTron', () => {
  test('should throw a not implemented error from derive', async () => {
    await expect(new ISignerTron().derive("0'/0/0")).rejects.toThrow(expect.objectContaining({ constructor: NotImplementedError, message: "Method 'derive(path)' is not implemented." }))
  })

  test('should throw a not implemented error from signTransaction', async () => {
    await expect(new ISignerTron().signTransaction({})).rejects.toThrow(expect.objectContaining({ constructor: NotImplementedError, message: "Method 'signTransaction(transaction)' is not implemented." }))
  })
})
