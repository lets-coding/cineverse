import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'CineVerse',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'cineverse_default_jwt_secret_key_development_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  storageBucket: process.env.STORAGE_BUCKET || 'cineverse-media',
  storagePublicUrl: process.env.STORAGE_PUBLIC_URL || 'http://localhost:5000/uploads',
};
