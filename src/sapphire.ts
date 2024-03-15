import './lib/setup.js';

import { readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

import Database from './lib/database.js';
import {createEmitter, Emitter} from './lib/typedEvents.js';
import {emitterSpec} from './lib/events.js';

import { LogLevel, container, SapphireClient } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { GatewayIntentBits, Partials } from 'discord.js';

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
			},
		});
		for (const d of readdirSync(join(this.rootData.root, 'cogs'))) {
			container.logger.info('Registering cog: ' + basename(d));
			this.stores.registerPath(d);
		}
	}

	public override async login(token?: string) {
		container.database = new Database();
		container.events = createEmitter<emitterSpec>();
		return super.login(token);
	  }
}

declare module '@sapphire/pieces' {
	interface Container {
	  database: Database;
	  events: Emitter<emitterSpec>;
	}
}