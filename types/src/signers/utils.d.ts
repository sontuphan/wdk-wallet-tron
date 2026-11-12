/** @typedef {import('tronweb').Types.Transaction} Transaction */
/** @typedef {import('tronweb').Types.SignedTransaction} SignedTransaction */
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
 */
export function signTransaction(privateKey: Uint8Array, transaction: Transaction | SignedTransaction): SignedTransaction;
export type Transaction = import("tronweb").Types.Transaction;
export type SignedTransaction = import("tronweb").Types.SignedTransaction;
