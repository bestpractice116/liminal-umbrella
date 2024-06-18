import { container } from '@sapphire/framework';
import { srcDir } from '../../lib/constants.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { ActivityType } from 'discord.js';
import { getChannelAndSend } from '../verboseLog/utils.js';
import { Activity } from '../../lib/database/model.js';

// TODO - remove this function
export function getActivityListFile(): string[] {
    const fn = join(srcDir, 'cogs', 'randomActivity', 'playing.txt');
    return readFileSync(fn, 'utf-8').split(/\r?\n/).filter(phrase => !!phrase.match(/\S/));
}

// TODO - is it even worth keeping this cache?
let activityList: string[] | null = null;
export async function getActivityList(): Promise<string[]> {
    if (activityList === null) {
        const activities = await Activity.findAll({ where: { type: 'playing'}, attributes: ['name'] });
        activityList = activities.map((activity: Activity) => activity.name);
    }
    return activityList!
}

export function clearActivityCache() {
    activityList = null;
}

export async function setRandomActivity() {
    const lines = await getActivityList();
    const thing = lines[Math.floor(Math.random()*lines.length)];
    getChannelAndSend(`Set activity: Playing ${thing}`);
    container.client.user?.setActivity({ name: thing, type: ActivityType.Playing });
}
