import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');
