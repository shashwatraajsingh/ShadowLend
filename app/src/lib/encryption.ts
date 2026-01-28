/**
 * Inco Lightning Encryption Module
 *
 * This module handles client-side encryption/decryption for confidential data.
 * In production, this integrates with Inco Lightning's MPC network.
 *
 * Architecture:
 * 1. User's wallet keypair derives an encryption key
 * 2. Sensitive data (collateral, debt) is encrypted before on-chain storage
 * 3. Only the position owner can decrypt their data
 * 4. Inco MPC nodes verify computations without revealing plaintext
 */

import nacl from "tweetnacl";
import { decodeUTF8, encodeBase64, decodeBase64 } from "tweetnacl-util";

// Encryption key derivation from wallet signature
const ENCRYPTION_DOMAIN = "ShadowLend:v1:encryption";

export interface EncryptionKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface EncryptedValue {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

/**
 * Derive encryption keypair from wallet signature
 * User signs a domain-specific message, hash is used as seed
 */
export async function deriveEncryptionKey(
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<EncryptionKeyPair> {
  const message = decodeUTF8(ENCRYPTION_DOMAIN);
  const signature = await signMessage(message);

  // Use first 32 bytes of signature as seed
  const seed = signature.slice(0, 32);
  const keyPair = nacl.box.keyPair.fromSecretKey(seed);

  return {
    publicKey: keyPair.publicKey,
    secretKey: keyPair.secretKey,
  };
}

/**
 * Encrypt a numeric value for on-chain storage
 * Returns 32-byte ciphertext suitable for Position account
 *
 * Format: [8-byte XOR-encrypted amount] + [24-byte nonce]
 * The amount is XOR'd with first 8 bytes of nacl.hash(nonce + secretKey)
 * This provides confidentiality while fitting in 32 bytes
 */
export function encryptAmount(
  amount: bigint,
  keyPair: EncryptionKeyPair
): Uint8Array {
  // Convert amount to 8-byte buffer (u64 little-endian)
  const amountBuffer = new ArrayBuffer(8);
  const amountView = new DataView(amountBuffer);
  amountView.setBigUint64(0, amount, true);
  const plaintext = new Uint8Array(amountBuffer);

  // Generate random nonce
  const nonce = nacl.randomBytes(24);

  // Derive encryption mask from nonce + secret key
  const maskInput = new Uint8Array(24 + 32);
  maskInput.set(nonce, 0);
  maskInput.set(keyPair.secretKey.slice(0, 32), 24);
  const mask = nacl.hash(maskInput).slice(0, 8);

  // XOR plaintext with mask
  const encrypted = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    encrypted[i] = plaintext[i] ^ mask[i];
  }

  // Pack into 32 bytes: [encrypted (8)] + [nonce (24)]
  const result = new Uint8Array(32);
  result.set(encrypted, 0);
  result.set(nonce, 8);

  return result;
}

/**
 * Decrypt a 32-byte on-chain ciphertext to numeric value
 */
export function decryptAmount(
  encrypted: Uint8Array,
  keyPair: EncryptionKeyPair
): bigint | null {
  if (encrypted.length !== 32) {
    return null;
  }

  // Check if all zeros (empty/uninitialized)
  if (encrypted.every((b) => b === 0)) {
    return BigInt(0);
  }

  try {
    // Extract encrypted amount and nonce
    const encryptedAmount = encrypted.slice(0, 8);
    const nonce = encrypted.slice(8, 32);

    // Derive decryption mask from nonce + secret key
    const maskInput = new Uint8Array(24 + 32);
    maskInput.set(nonce, 0);
    maskInput.set(keyPair.secretKey.slice(0, 32), 24);
    const mask = nacl.hash(maskInput).slice(0, 8);

    // XOR to decrypt
    const decrypted = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      decrypted[i] = encryptedAmount[i] ^ mask[i];
    }

    // Convert to bigint
    const view = new DataView(decrypted.buffer);
    return view.getBigUint64(0, true);
  } catch {
    return null;
  }
}

/**
 * Generate Inco proof for borrow operation
 * In production: This calls Inco Lightning's MPC network
 *
 * The proof verifies: collateral * LTV >= debt + borrowAmount
 * Without revealing the actual values
 */
export async function generateBorrowProof(
  encryptedCollateral: Uint8Array,
  encryptedDebt: Uint8Array,
  borrowAmount: bigint,
  ltvRatio: number // basis points
): Promise<Uint8Array> {
  // Placeholder for Inco Lightning integration
  // In production:
  // 1. Submit encrypted values to Inco MPC
  // 2. MPC computes comparison homomorphically
  // 3. Returns proof of valid borrow

  // For demo: return dummy proof
  const proof = new Uint8Array(64);
  proof.set(encryptedCollateral.slice(0, 16), 0);
  proof.set(encryptedDebt.slice(0, 16), 16);

  const borrowBytes = new Uint8Array(8);
  new DataView(borrowBytes.buffer).setBigUint64(0, borrowAmount, true);
  proof.set(borrowBytes, 32);

  const ltvBytes = new Uint8Array(2);
  new DataView(ltvBytes.buffer).setUint16(0, ltvRatio, true);
  proof.set(ltvBytes, 40);

  return proof;
}

/**
 * Generate Inco proof for withdrawal operation
 * Verifies remaining collateral maintains healthy position
 */
export async function generateWithdrawalProof(
  encryptedCollateral: Uint8Array,
  encryptedDebt: Uint8Array,
  withdrawAmount: bigint,
  ltvRatio: number
): Promise<Uint8Array> {
  // Placeholder for Inco Lightning integration
  const proof = new Uint8Array(64);
  proof.set(encryptedCollateral.slice(0, 16), 0);
  proof.set(encryptedDebt.slice(0, 16), 16);

  const withdrawBytes = new Uint8Array(8);
  new DataView(withdrawBytes.buffer).setBigUint64(0, withdrawAmount, true);
  proof.set(withdrawBytes, 32);

  return proof;
}

/**
 * Generate Inco proof for liquidation
 * Proves health factor < liquidation threshold
 */
export async function generateLiquidationProof(
  encryptedCollateral: Uint8Array,
  encryptedDebt: Uint8Array,
  liquidationThreshold: number
): Promise<Uint8Array> {
  // Placeholder for Inco Lightning integration
  const proof = new Uint8Array(64);
  proof.set(encryptedCollateral.slice(0, 16), 0);
  proof.set(encryptedDebt.slice(0, 16), 16);

  const thresholdBytes = new Uint8Array(2);
  new DataView(thresholdBytes.buffer).setUint16(0, liquidationThreshold, true);
  proof.set(thresholdBytes, 32);

  return proof;
}

/**
 * Compute health factor from decrypted values
 * health = (collateral * liquidationThreshold) / debt
 * Returns as percentage (100 = healthy at threshold)
 */
export function computeHealthFactor(
  collateral: bigint,
  debt: bigint,
  liquidationThreshold: number // basis points
): number {
  if (debt === BigInt(0)) {
    return Infinity;
  }

  const numerator = collateral * BigInt(liquidationThreshold);
  const denominator = debt * BigInt(10000);

  return Number(numerator * BigInt(100) / denominator);
}

/**
 * Encode encrypted value for display (base64)
 */
export function encodeEncrypted(data: Uint8Array): string {
  return encodeBase64(data);
}

/**
 * Decode encrypted value from base64
 */
export function decodeEncrypted(encoded: string): Uint8Array {
  return decodeBase64(encoded);
}
