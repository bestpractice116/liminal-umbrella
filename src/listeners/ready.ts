import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Client } from 'discord.js';
import type { StoreRegistryValue } from '@sapphire/pieces';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import {Sequential} from '../lib/utils.js';
import {BotStarted} from '../lib/events/index.js';

const dev = process.env.NODE_ENV !== 'production';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	@Sequential
	public override async run(client: Client) {
		client.guilds.fetch(process.env.DISCORD_GUILD_ID).then(async (guild) => {
			this.container.guild = guild;
			await this.container.database.doMigrations(guild);
			await this.container.database.getHighestWatermark()
			const start = Date.now();
			await this.container.database.sync(guild);
			await this.container.database.syncChannelGameListings(guild, 'game_listings');
			this.container.events.emit('botStarted', new BotStarted(guild));
			this.container.database.setHighestWatermark(start);
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
