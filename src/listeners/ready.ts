import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';
import type { Client } from 'discord.js';
import type { StoreRegistryValue } from '@sapphire/pieces';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import { Sequential } from '../lib/utils.js';
import { getGameListingChannel } from '../lib/discord.js';
import { BotStarted } from '../lib/events/index.js';
import { Methods } from '@sapphire/plugin-api';
const dev = process.env.NODE_ENV !== 'production';

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
	constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.ClientReady
		});
	}

	private readonly style = dev ? yellow : blue;

	public override async run(client: Client) {
		client.guilds.fetch(this.container.guildId).then(async (guild) => {
			this.container.guild = guild;
			/*
			const db = await this.container.database.getdb();
			await db.sync()
		       	*/
			await this.doInitialDbSync();
			this.container.events.emit('botStarted', new BotStarted(guild));
		});
		this.printBanner();
		this.printStoreDebugInformation();
	}

	@Sequential
	async doInitialDbSync() {
		const guild = this.container.guild!;
		await this.container.database.doMigrations(guild);
		await this.container.database.getHighestWatermark();
		const start = Date.now();
		await this.container.database.sync(guild);
		const gameListingsChannel = await getGameListingChannel();
		if (gameListingsChannel) {
			await this.container.database.syncChannel(gameListingsChannel);
		}
		this.container.database.setHighestWatermark(start);
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
		const routes = client.stores.get('routes');
		for (const routeType of ['GET', 'POST']) {
			for (const route of routes.table.get(routeType as Methods)!.keys()) {
				logger.info(gray(`├─ Loaded route ${routeType} /${route.router.path}.`));
			}
		}
	}

	private styleStore(store: StoreRegistryValue, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
