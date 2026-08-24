import dotenv from 'dotenv';
dotenv.config();

// --- SECURITY: Fail-fast on missing or weak secrets ---
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    '[SECURITY] JWT_SECRET is missing or too short (minimum 32 characters). ' +
    'Set a strong secret in your .env file before starting the server.'
  );
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  PAYMENT_SANDBOX_ENABLED: process.env.PAYMENT_SANDBOX_ENABLED === 'true'
};
