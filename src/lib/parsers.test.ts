import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import {expect, test, describe} from '@jest/globals';


import type {AGameSession} from './parsers.ts';
import {parseAvailableGame} from './parsers.ts';
describe('parseAvailableGames', () => {
//describe('parseAvailableGames' () => {
  const basePath = join(__dirname, '..', '..', 'testdata', 'parsers', 'available_games' );

  for (const d of readdirSync(basePath)) {
    test(d, () => {
      const input = readFileSync(join(basePath, d, "input")).toString();
      const expStr = readFileSync(join(basePath, d, "output.json"));
      const expected : AGameSession = JSON.parse(expStr.toString());
      expect(parseAvailableGame(input)).toStrictEqual(expected);
    });
  }
});