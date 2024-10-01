import { Listener, container } from '@sapphire/framework';
import { TickOneTwenty } from '../../../lib/events/index.js';
import { Sequential } from '../../../lib/utils.js';
import { User } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { shortSleep, sleepUpToTwoHours } from '../../../lib/utils.js';
import { CustomEvents } from '../../../lib/events.js';

const CLEANUP_GAME_LISTINGS_AFTER_TIME = 1 * 24 * 60 * 60 * 1000; // 1 day ago
const CLEANUP_GAME_CHANNELS_AFTER_TIME = 10 * 24 * 60 * 60 * 1000; // 10 days ago

type GameChannelsLocked = {
	considered: number;
	locked: number;
};

export class greetNewUsersTickOneTwentyListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'greetNewUsersTickOneTwentyListener',
			emitter: container.events,
			event: CustomEvents.TickOneTwenty
		});
	}

	async run(_e: TickOneTwenty) {
		await sleepUpToTwoHours();
		this.container.logger.info('Doing greetNewUsers find now');
		await this.doMissedGreetings();
		this.container.logger.info('Finished greetNewUsers find');
	}

	async doMissedGreetings() {
		const missedGreetings = await this.findMissedGreetings();
		this.container.logger.info(`Found ${missedGreetings.length} misssed greetings to send`);
		for (const user of missedGreetings) {
			await this.sendMissedGreeting(user);
			await shortSleep();
		}
	}

	@Sequential
	findMissedGreetings() {
		return User.findAll({
			include: ['greetingMessage'],
			where: {
				left: false,
				bot: false,
				'$greetingMessage.userId$': { [Op.eq]: null }
			}
		});
	}

	@Sequential
	async sendMissedGreeting(user: User) {
		//const db = await this.container.database.getdb();
		this.container.logger.info(`Send greeting to ${user.nickname}`);
	}
}
