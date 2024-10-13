import { Listener, container } from '@sapphire/framework';
import { UserWinnow } from '../../../lib/events/index.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';
import { getMessage } from '../../../lib/message.js';

export class verboseLogUserWinnowListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'verboseLogUserWinnow',
            emitter: container.events,
            event: CUSTOM_EVENTS.UserWinnow
        });
    }
    async run(e: UserWinnow) {
        const guildMember = await container.guild!.members.fetch(e.id);
        const msg = await getMessage('USER_NO_NAME_CHANGE_KICK', {});
        await (
            await this.container.database.getdb()
        ).transaction(async () => {
            e.dbUser.set({ kicked: true });
            await guildMember.send(msg);
            await guildMember.kick(
                `RPGBot Kicked user ${e.dbUser.nickname} (${e.dbUser.name} : ${e.dbUser.key} due to Winnow event`
            );
            await e.dbUser.save();
        });
    }
}
