import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, describe } from '@jest/globals';

import type { AGameSession } from './parsers.js';
import { parseAvailableGame } from './parsers.js';
describe('parseAvailableGames', () => {
    const basePath = join(__dirname, '..', '..', 'testdata', 'parsers', 'available_games');

    for (const d of readdirSync(basePath)) {
        test(d, () => {
            const input = readFileSync(join(basePath, d, 'input')).toString();
            const expStr = readFileSync(join(basePath, d, 'output.json'));
            const expected = JSON.parse(expStr.toString()) as AGameSession;
            expect(parseAvailableGame(input)).toStrictEqual(expected);
        });
    }
});
