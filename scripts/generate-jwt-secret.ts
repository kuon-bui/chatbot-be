import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Generates a secure random JWT secret
 * @param length - Length of the secret in bytes (default: 64)
 * @returns A base64 encoded string
 */
function generateJwtSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Updates or creates the .env file with the JWT_SECRET
 * @param secret - The JWT secret to save
 */
function saveToEnvFile(secret: string): void {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  let envContent = '';

  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');

    // Check if JWT_SECRET already exists
    if (envContent.includes('JWT_SECRET=')) {
      // Replace existing JWT_SECRET
      envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${secret}`);
    } else {
      // Add JWT_SECRET if it doesn't exist
      envContent += `\nJWT_SECRET=${secret}\n`;
    }
  } else {
    // If .env doesn't exist, create it from .env.example or create new
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf-8');
      envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${secret}`);
    } else {
      envContent = `JWT_SECRET=${secret}\n`;
    }
  }

  // Write the updated content back to .env
  fs.writeFileSync(envPath, envContent);
}

// Main execution
const jwtSecret = generateJwtSecret();
console.log("\nJWT Secret:", jwtSecret);
saveToEnvFile(jwtSecret);
console.log('\nJWT Secret generated successfully!');
