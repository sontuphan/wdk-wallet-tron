/** @typedef {import('./signer-tron.js').ISignerTron} ISignerTron */
/** @typedef {import('@tetherto/wdk-wallet').KeyPair} KeyPair */
/** @typedef {import('tronweb').Types.Transaction} Transaction */
/** @typedef {import('tronweb').Types.SignedTransaction} SignedTransaction */
/**
 * Absolute BIP-44 prefix for Tron (m/purpose'/coin_type').
 */
export const BIP_44_TRON_DERIVATION_PATH_PREFIX: "m/44'/195'";
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
export default class SeedSignerTron implements ISignerTron {
    /**
     * Creates a new seed signer.
     *
     * @param {string | Uint8Array} seed - A BIP-39 mnemonic seed phrase, or a raw BIP-32 master seed (16-64 bytes).
     * @param {string} [path] - An absolute BIP-32 path (default: "m/44'/195'").
     * @throws {ValueError} If the seed phrase is invalid, if the seed is not 16 to 64 bytes, or if the path is not valid.
     * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
     */
    constructor(seed: string | Uint8Array, path?: string);
    /** @private */
    private _init;
    /** @private */
    private _node;
    /** @private */
    private _path;
    /** @private */
    private _address;
    /** @private */
    private _disposed;
    /**
     * Whether the signer supports account derivation via {@link derive}. Always true: every seed
     * signer holds an HD node and can derive below its own path.
     *
     * @type {true}
     */
    get isDerivable(): true;
    /**
     * The BIP 0032 derivation path, or null if the signer is not bound to a derivation position
     * (e.g. private-key signers). A seed signer is always bound, so this is its absolute path.
     *
     * @type {string}
     */
    get path(): string;
    /**
     * True if the signer has been disposed.
     *
     * @type {boolean}
     */
    get disposed(): boolean;
    /**
     * The signer's key pair, or null if the signer does not allow retrieving key material (e.g. hardware
     * signers). A seed signer always exposes its key pair; the private key is null once it is disposed.
     *
     * @type {KeyPair}
     */
    get keyPair(): KeyPair;
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
    derive(relPath: string): Promise<SeedSignerTron>;
    /**
     * Returns the signer's address.
     *
     * @returns {Promise<string>} The signer's address.
     */
    getAddress(): Promise<string>;
    /**
     * Signs a message.
     *
     * @param {string} message - The message to sign.
     * @returns {Promise<string>} The message's signature.
     * @throws {DisposalError} If the signer has been disposed.
     */
    sign(message: string): Promise<string>;
    /**
     * Signs a transaction, keeping any signatures it already carries.
     *
     * @param {Transaction | SignedTransaction} transaction - The tron web transaction.
     * @returns {Promise<SignedTransaction>} The transaction with this signer's signature appended.
     * @throws {ValueError} If the transaction id is not a 32-byte hex string.
     * @throws {DisposalError} If the signer has been disposed.
     */
    signTransaction(transaction: Transaction | SignedTransaction): Promise<SignedTransaction>;
    /**
     * Disposes the signer, securely erasing its private key and chain code from memory.
     */
    dispose(): void;
}
export type ISignerTron = import("./signer-tron.js").ISignerTron;
export type KeyPair = import("@tetherto/wdk-wallet").KeyPair;
export type Transaction = import("tronweb").Types.Transaction;
export type SignedTransaction = import("tronweb").Types.SignedTransaction;
