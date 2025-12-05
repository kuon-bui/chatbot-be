import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RsaService implements OnModuleInit {
  private publicKey: string;
  private privateKey: string;

  constructor() { }

  onModuleInit() {
    this.loadKeys();
  }

  private loadKeys() {
    const keysDir = path.join(process.cwd(), 'keys');
    const publicKeyPath = path.join(keysDir, 'public_key.pem');
    const privateKeyPath = path.join(keysDir, 'private_key.pem');

    if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
      throw new Error(
        'RSA keys not found. Please run "npm run generate:keys" to generate them.',
      );
    }

    this.publicKey = fs.readFileSync(publicKeyPath, 'utf-8');
    this.privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
  }

  /**
   * Encrypt data using public key
   * @param data - Data to encrypt (string)
   * @returns Base64 encoded encrypted data
   */
  encrypt(data: string): string {
    const buffer = Buffer.from(data, 'utf-8');
    const encrypted = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return encrypted.toString('base64');
  }

  /**
   * Decrypt data using private key
   * @param encryptedData - Base64 encoded encrypted data
   * @returns Decrypted string
   */
  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return decrypted.toString('utf-8');
  }

  /**
   * Sign data using private key
   * @param data - Data to sign
   * @returns Base64 encoded signature
   */
  sign(data: string): string {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    sign.end();
    const signature = sign.sign(this.privateKey);
    return signature.toString('base64');
  }

  /**
   * Verify signature using public key
   * @param data - Original data
   * @param signature - Base64 encoded signature
   * @returns Boolean indicating if signature is valid
   */
  verify(data: string, signature: string): boolean {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    verify.end();
    const signatureBuffer = Buffer.from(signature, 'base64');
    return verify.verify(this.publicKey, signatureBuffer);
  }

  /**
   * Get public key
   * @returns Public key in PEM format
   */
  getPublicKey(): string {
    return this.publicKey;
  }
}
