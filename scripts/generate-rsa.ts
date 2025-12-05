import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Generate a 2048-bit RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Define keys directory
const keysDir = path.join(__dirname, '..', 'keys');

// Create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Define file paths
const publicKeyPath = path.join(keysDir, 'public_key.pem');
const privateKeyPath = path.join(keysDir, 'private_key.pem');

// Write the public key to a file
fs.writeFileSync(publicKeyPath, publicKey);
console.log(`Public key saved to: ${publicKeyPath}`);

// Write the private key to a file
fs.writeFileSync(privateKeyPath, privateKey);
console.log(`Private key saved to: ${privateKeyPath}`);
