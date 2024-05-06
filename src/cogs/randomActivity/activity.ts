import { container } from '@sapphire/framework';
import { srcDir } from '../../lib/constants.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { ActivityType } from 'discord.js';
import { getChannelAndSend } from '../verboseLog/utils.js';

const fn = join(srcDir, 'cogs', 'randomActivity', 'playing.txt');
const lines = readFileSync(fn, 'utf-8').split(/\r?\n/).filter(phrase => !!phrase.match(/\S/));

export function setRandomActivity() {
    const thing = lines[Math.floor(Math.random()*lines.length)];
    getChannelAndSend(`Set activity: Playing ${thing}`);
    container.client.user?.setActivity({ name: thing, type: ActivityType.Playing });
}
