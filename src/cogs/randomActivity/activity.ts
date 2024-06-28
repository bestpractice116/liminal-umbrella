import { container } from '@sapphire/framework';
import { ActivityType } from 'discord.js';
import { getChannelAndSend } from '../verboseLog/utils.js';
import { Activity } from '../../lib/database/model.js';

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
