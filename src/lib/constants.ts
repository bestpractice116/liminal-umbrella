import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const APP_URL = process.env.FLY_APP_NAME ? `https://${process.env.FLY_APP_NAME}.fly.dev/` : 'http://127.0.0.1:5173/'