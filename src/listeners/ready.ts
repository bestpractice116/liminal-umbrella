import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Client } from 'discord.js';
import type { StoreRegistryValue } from '@sapphire/pieces';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import { db, User } from '../lib/database';

const dev = process.env.NODE_ENV !== 'production';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	public override async run(client: Client) {
		await db.sync({ force: true });
		console.log("Synced db");
		client.guilds.fetch("1205971443523788840").then(async (guild) => {
			const dbusers = await User.activeUsersMap();
			const members = await guild.members.fetch();
			const missingMembers = [];
			for (const [id, guildMember] of members) {
				if (guildMember.user.bot) {
					continue;
				}
				const dbMember = dbusers.get(id);
				if (!dbMember) {
					missingMembers.push(id);
				}
				dbusers.delete(id);
			}
			for (const missingId of missingMembers) {
				console.log("database is missing member " + missingId);
				const guildMember = members.get(missingId)!;
				console.log("database is missing member " + missingId + " " + (guildMember.nickname || guildMember.user.globalName));
				await User.create({
					id: missingId,
					username: (guildMember.nickname || guildMember.user.globalName)!,
					rulesaccepted: false, // FIXME
					left: false,
				});
			}
			for (const [id, dbMember] of dbusers) {
				console.log("database has user who has left " + id);
				dbMember.left = true;
				await dbMember.save();
			}
			console.log("DONE");
				//console.log(id);
				//console.log();
				//console.log(guildMember);
		});
		this.printBanner();
		this.printStoreDebugInformation();
	}

	private printBanner() {
		const success = green('+');

		const llc = dev ? magentaBright : white;
		const blc = dev ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: StoreRegistryValue, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
