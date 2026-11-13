// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import * as bip39 from 'bip39'
import { HDKey } from '@scure/bip32'

// eslint-disable-next-line camelcase
import { sodium_memzero } from 'sodium-universal'

import { DisposalError, ValueError } from '@tetherto/wdk-wallet'

import { getTronAddress, parseDerivationPath, signMessage, signTransaction } from './signer-tron.js'

/** @typedef {import('./signer-tron.js').ISignerTron} ISignerTron */
/** @typedef {import('@tetherto/wdk-wallet').KeyPair} KeyPair */
/** @typedef {import('tronweb').Types.Transaction} Transaction */
/** @typedef {import('tronweb').Types.SignedTransaction} SignedTransaction */

/**
 * Absolute BIP-44 prefix for Tron (m/purpose'/coin_type').
 */
export const BIP_44_TRON_DERIVATION_PATH_PREFIX = "m/44'/195'"

const MIN_SEED_LENGTH_IN_BYTES = 16

const MAX_SEED_LENGTH_IN_BYTES = 64

/**
 * Securely erases an HD node's private key and chain code from memory.
 *
 * @param {HDKey} node - The HD node.
 */
function scrub (node) {
  if (node.privKeyBytes) {
    sodium_memzero(node.privKeyBytes)
  }

  if (node.chainCode) {
    sodium_memzero(node.chainCode)
  }

  node.privKeyBytes = undefined
  node.privKey = undefined
}

/**
 * Derives an HD node along the given child indexes, erasing every node it leaves behind,
 * including the starting one, so that only the returned node holds key material. A node is
 * erased even when deriving its child throws, so a failed derivation leaves no key material behind.
 *
 * @param {HDKey} node - The starting HD node.
 * @param {number[]} indexes - The child indexes to derive.
 * @returns {HDKey} The HD node at the end of the path.
 * @throws {Error} If a derived child key is invalid (probability below 2^-127 per derivation).
 */
function deriveAndScrub (node, indexes) {
  for (const index of indexes) {
    let child

    try {
      child = node.deriveChild(index)
    } finally {
      scrub(node)
    }

    node = child
  }

  return node
}

/**
 * Signer implementation that derives keys from a BIP-39 seed using a BIP-32 path.
 *
 * Every signer holds exactly one HD node (the Tron BIP-44 coin node "m/44'/195'" by default, ready to
 * derive accounts below it) and owns an independent copy of its key, so disposing one never affects
 * its parent, children or siblings. Intermediate nodes built while deriving (including the master
 * node) are erased as soon as they are no longer needed.
 *
 * @implements {ISignerTron}
 */
export default class SeedSignerTron {
  /**
   * Creates a new seed signer.
   *
   * @param {string | Uint8Array} seed - A BIP-39 mnemonic seed phrase, or a raw BIP-32 master seed (16-64 bytes).
   * @param {string} [path] - An absolute BIP-32 path (default: "m/44'/195'").
   * @throws {ValueError} If the seed phrase is invalid, if the seed is not 16 to 64 bytes, or if the path is not valid.
   * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
   */
  constructor (seed, path = BIP_44_TRON_DERIVATION_PATH_PREFIX) {
    const ownsSeed = typeof seed === 'string'

    if (ownsSeed) {
      if (!bip39.validateMnemonic(seed)) {
        throw new ValueError('The seed phrase is invalid.')
      }
    } else if (seed.length < MIN_SEED_LENGTH_IN_BYTES || seed.length > MAX_SEED_LENGTH_IN_BYTES) {
      throw new ValueError(`The seed must be between ${MIN_SEED_LENGTH_IN_BYTES} and ${MAX_SEED_LENGTH_IN_BYTES} bytes.`)
    }

    const seedBytes = ownsSeed ? bip39.mnemonicToSeedSync(seed) : seed

    let indexes, master

    try {
      indexes = parseDerivationPath(path, { requireAbsolute: true })

      master = HDKey.fromMasterSeed(seedBytes)
    } finally {
      if (ownsSeed) {
        sodium_memzero(seedBytes)
      }
    }

    this._init(path, deriveAndScrub(master, indexes))
  }

  /**
   * Whether the signer supports account derivation via {@link derive}.
   *
   * @type {true}
   */
  get isDerivable () {
    return true
  }

  /**
   * The BIP 0032 derivation path, or null if the signer is not bound to a derivation position
   * (e.g. private-key signers). A seed signer is always bound, so this is its absolute path.
   *
   * @type {string}
   */
  get path () {
    return this._path
  }

  /**
   * True if the signer has been disposed.
   *
   * @type {boolean}
   */
  get disposed () {
    return this._disposed
  }

  /**
   * The signer's key pair, or null if the signer does not allow retrieving key material (e.g. hardware
   * signers). A seed signer always exposes its key pair; the private key is null once it is disposed.
   *
   * @type {KeyPair}
   */
  get keyPair () {
    return {
      privateKey: this._node.privateKey ?? null,
      publicKey: this._node.publicKey
    }
  }

  /**
   * Derive a child signer using a relative path (e.g., "0'/0/0"). The path is relative to this signer's
   * own path: calling derive("0'/0/1") on a signer at "m/44'/195'" yields a child at "m/44'/195'/0'/0/1".
   * The child owns an independent copy of its key and can itself derive further.
   *
   * @param {string} relPath - The path to derive, relative to this signer's own path.
   * @returns {Promise<SeedSignerTron>} The derived child signer.
   * @throws {ValueError} If the path is not valid.
   * @throws {DisposalError} If the signer has been disposed.
   */
  async derive (relPath) {
    if (this._disposed) {
      throw new DisposalError('The signer has been disposed.')
    }

    const [first, ...rest] = parseDerivationPath(relPath)

    const node = deriveAndScrub(this._node.deriveChild(first), rest)

    const signer = Object.create(SeedSignerTron.prototype)
    signer._init(`${this._path}/${relPath}`, node)

    return signer
  }

  /**
   * Returns the signer's address.
   *
   * @returns {Promise<string>} The signer's address.
   */
  async getAddress () {
    return this._address
  }

  /**
   * Signs a message.
   *
   * @param {string} message - The message to sign.
   * @returns {Promise<string>} The message's signature.
   * @throws {DisposalError} If the signer has been disposed.
   */
  async sign (message) {
    if (this._disposed) {
      throw new DisposalError('The signer has been disposed.')
    }

    return signMessage(this._node.privateKey, message)
  }

  /**
   * Signs a transaction.
   *
   * @param {Transaction} unsignedTx - The unsigned tron web transaction.
   * @returns {Promise<SignedTransaction>} The signed transaction.
   * @throws {ValueError} If the transaction id is not a 32-byte hex string.
   * @throws {DisposalError} If the signer has been disposed.
   */
  async signTransaction (unsignedTx) {
    if (this._disposed) {
      throw new DisposalError('The signer has been disposed.')
    }

    return signTransaction(this._node.privateKey, unsignedTx)
  }

  /**
   * Disposes the object along with all its data (cleaning up any sensitive field from memory): for a seed signer, its
   * private key and chain code.
   */
  dispose () {
    scrub(this._node)

    this._disposed = true
  }

  /** @private */
  _init (path, node) {
    /** @private */
    this._node = node

    /** @private */
    this._path = path

    /** @private */
    this._address = getTronAddress(node.publicKey)

    /** @private */
    this._disposed = false
  }
}
