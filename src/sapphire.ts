import './lib/setup.js';
import Database from './lib/database.js';
import {discordEvents, Emitter} from './lib/discordevents.js';
import type {emitterSpec} from './lib/discordevents.js';

import { LogLevel, container, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';

export class MySapphireClient extends SapphireClient {
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
	}

	public override async login(token?: string) {
		container.database = new Database();
		container.events = discordEvents;
		return super.login(token);
	  }
}

declare module '@sapphire/pieces' {
	interface Container {
	  database: Database;
	  events: Emitter<emitterSpec>;
	}
}