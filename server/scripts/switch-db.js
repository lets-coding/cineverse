#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect target provider from CLI argument OR environment variable DATABASE_URL
let targetDb = process.argv[2]?.toLowerCase();

if (!targetDb) {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || '';
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    targetDb = 'postgresql';
  } else {
    targetDb = 'sqlite';
  }
}

const provider = ['postgres', 'postgresql'].includes(targetDb) ? 'postgresql' : 'sqlite';
const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');

if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, 'utf8');
  content = content.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, `provider = "${provider}"`);
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log(`[CineVerse DB Config] Prisma datasource provider configured for: "${provider}"`);
}
