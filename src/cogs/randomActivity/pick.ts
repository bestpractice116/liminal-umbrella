import { srcDir } from '../../lib/constants.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { ActivityType, ActivityOptions } from 'discord.js';

const fn = join(srcDir, 'cogs', 'randomActivity', 'playing.txt');
const lines = readFileSync(fn, 'utf-8').split(/\r?\n/);

export function pickActivity() : ActivityOptions {
    const thing = lines[Math.floor(Math.random()*lines.length)];
    return { name: thing, type: ActivityType.Playing }
}
