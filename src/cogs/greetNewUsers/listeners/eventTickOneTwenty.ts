import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
import { Sequential, shortSleep } from '../../../lib/utils.js';
import { User } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { CustomEvents } from '../../../lib/events.js';
import { doUserGreeting } from '../utils.js';

export class greetNewUsersTickOneTwentyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'greetNewUsersTickOneTwentyListener',
            emitter: container.events,
            event: CustomEvents.TickOneTwenty
        });
    }

    async run(_e: TickFive) {
        //await sleepUpToTwoHours();
        await this.doMissedGreetings();
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
        this.container.logger.info(`Missing greeting message for user ${user.nickname}: ${user.key}`);
        await doUserGreeting(user);
    }
}
