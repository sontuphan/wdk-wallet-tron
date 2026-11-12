import { describe, expect, test } from '@jest/globals'

import { NotImplementedError } from '@tetherto/wdk-wallet'

import { ISignerTron } from '../../src/signers/signer-tron.js'

describe('ISignerTron', () => {
  test('should throw a not implemented error from derive', async () => {
    await expect(new ISignerTron().derive("0'/0/0")).rejects.toBeInstanceOf(NotImplementedError)
  })

  test('should throw a not implemented error from signTransaction', async () => {
    await expect(new ISignerTron().signTransaction({})).rejects.toBeInstanceOf(NotImplementedError)
  })
})
