/**
 * Parses a BIP-32 derivation path into child indexes.
 *
 * @param {string} path - The derivation path; absolute ("m" or "m/...") if `options.requireAbsolute` is true, relative (e.g. "0'/0/0") otherwise.
 * @param {Object} [options] - The parsing options.
 * @param {boolean} [options.requireAbsolute] - If true, the path must be absolute (default: false).
 * @returns {number[]} The child indexes, with the hardened offset added to hardened ones.
 * @throws {ValueError} If the path is not valid.
 */
export function parseDerivationPath(path: string, { requireAbsolute }?: {
    requireAbsolute?: boolean;
}): number[];
/**
 * Returns the tron address of a secp256k1 public key.
 *
 * @param {Uint8Array} publicKey - The public key (compressed or uncompressed).
 * @returns {string} The address, in base58 format.
 */
export function getTronAddress(publicKey: Uint8Array): string;
/**
 * Signs a message with a raw secp256k1 private key, using the TRON signed message prefix.
 *
 * @param {Uint8Array} privateKey - The raw private key (32 bytes).
 * @param {string} message - The message to sign.
 * @returns {string} The message's signature, as a 0x-prefixed hex string.
 */
export function signMessage(privateKey: Uint8Array, message: string): string;
/**
 * Signs a transaction's id with a raw secp256k1 private key, keeping the signatures it already carries.
 *
 * @param {Uint8Array} privateKey - The raw private key (32 bytes).
 * @param {Transaction | SignedTransaction} transaction - The transaction.
 * @returns {SignedTransaction} The transaction with the key's signature appended.
 * @throws {ValueError} If the transaction id is not a 32-byte hex string.
 */
export function signTransaction(privateKey: Uint8Array, transaction: Transaction | SignedTransaction): SignedTransaction;
/** @typedef {import('@tetherto/wdk-wallet').DisposalError} DisposalError */
/** @typedef {import('@tetherto/wdk-wallet').UnsupportedOperationError} UnsupportedOperationError */
/** @typedef {import('tronweb').Types.Transaction} Transaction */
/** @typedef {import('tronweb').Types.SignedTransaction} SignedTransaction */
/**
 * Interface for Tron signers.
 *
 * @interface
 */
export interface ISignerTron extends ISigner {
    /**
     * Derive a child signer using a relative path (e.g., "0'/0/0").
     *
     * @param {string} path - The relative derivation path.
     * @returns {Promise<ISignerTron>} The derived signer.
     * @throws {UnsupportedOperationError} If the signer does not support account derivation.
     * @throws {ValueError} If the path is not valid.
     * @throws {DisposalError} If the signer has been disposed.
     * @throws {NotImplementedError} If the implementation does not override this method.
     */
    derive(path: string): Promise<ISignerTron>;
    /**
     * Signs a transaction, keeping any signatures it already carries.
     *
     * @param {Transaction | SignedTransaction} transaction - The tron web transaction.
     * @returns {Promise<SignedTransaction>} The transaction with this signer's signature appended.
     * @throws {ValueError} If the transaction id is not a 32-byte hex string.
     * @throws {DisposalError} If the signer has been disposed.
     * @throws {NotImplementedError} If the implementation does not override this method.
     */
    signTransaction(transaction: Transaction | SignedTransaction): Promise<SignedTransaction>;
}
export type DisposalError = import("@tetherto/wdk-wallet").DisposalError;
export type UnsupportedOperationError = import("@tetherto/wdk-wallet").UnsupportedOperationError;
export type Transaction = import("tronweb").Types.Transaction;
export type SignedTransaction = import("tronweb").Types.SignedTransaction;
import { ISigner } from '@tetherto/wdk-wallet';
