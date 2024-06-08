import './lib/setup.js';

import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import Database from './lib/database.js';
import {createEmitter, Emitter} from './lib/typedEvents.js';
import {emitterSpec} from './lib/events.js';
import Ticker from './lib/ticker.js';

import { LogLevel, container, SapphireClient } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { Guild, GatewayIntentBits, Partials, Options, OAuth2Scopes } from 'discord.js';

export class MySapphireClient extends SapphireClient {
	private rootData = getRootData();

	public constructor() {
	  // We call super our options
	  	super({
			//defaultPrefix: '!',
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
			partials: [Partials.Message, Partials.Channel, Partials.Reaction],
			intents: [
				GatewayIntentBits.DirectMessages,
				//GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMembers,
			],
			loadMessageCommandListeners: true,
			api: {
				listenOptions: { port: 8080 },
				auth: {
					id: process.env.DISCORD_APPLICATION_ID,
					secret: process.env.DISCORD_TOKEN!,
					scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
					cookie: 'SAPPHIRE_AUTH',
					domainOverwrite: '127.0.0.1', // FIXME for non dev
				  }
			},
			makeCache: Options.cacheWithLimits({
				...Options.DefaultMakeCacheSettings,
				MessageManager: 101, // Note this is 1 more than the amount we fetch at once in database.ts
			}),
			sweepers: {
				...Options.DefaultSweeperSettings,
				messages: {
					interval: 300, // Every 5m.
					lifetime: 300, // Remove messages older than 5 minutes.
				},
			},
		});
		for (const d of readdirSync(join(this.rootData.root, 'cogs'))) {
			container.logger.info('Registering cog: ' + d);
			this.stores.registerPath(join(this.rootData.root, 'cogs', d));
		}
	}

	public override async login(token?: string) : Promise<string> {
		container.events = createEmitter<emitterSpec>();
		container.database = new Database(container.events);
		container.ticker = new Ticker(container.events);
		return super.login(token);
	  }
}

declare module '@sapphire/pieces' {
	interface Container {
	  database: Database;
	  events: Emitter<emitterSpec>;
	  ticker: Ticker;
	  guild: Guild | null;
	}
}
