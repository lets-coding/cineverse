#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDb = process.argv[2]?.toLowerCase();
if (!['sqlite', 'postgresql', 'postgres'].includes(targetDb)) {
  console.log('Usage: node scripts/switch-db.js [sqlite|postgresql]');
  process.exit(1);
}

const provider = targetDb === 'sqlite' ? 'sqlite' : 'postgresql';
const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');

let content = fs.readFileSync(schemaPath, 'utf8');

// Replace provider = "..." with provider = "${provider}"
content = content.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, `provider = "${provider}"`);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log(`✅ Successfully switched Prisma provider to: "${provider}" in ${schemaPath}`);
console.log(`👉 Remember to run: npm run prisma:generate && npm run prisma:push`);
