import './lib/setup.js';

import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import Database from './lib/database.js';
import { createEmitter, Emitter } from './lib/typedEvents.js';
import { emitterSpec } from './lib/events.js';
import Ticker from './lib/ticker.js';
import authTransformer from './lib/api/authTransformer.js';

import { LogLevel, container, SapphireClient } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { Guild, GatewayIntentBits, Partials, Options, OAuth2Scopes } from 'discord.js';

export class MySapphireClient extends SapphireClient {
    private rootData = getRootData();

    public constructor() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const auth: any = {
            id: process.env.DISCORD_APPLICATION_ID,
            secret: process.env.DISCORD_OAUTH_CLIENT_SECRET,
            scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
            cookie: 'SAPPHIRE_AUTH',
            transformers: [authTransformer]
        };
        // Only used for local development
        if (process.env.DOMAIN_OVERWRITE) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            auth.DOMAIN_OVERWRITE = process.env.DOMAIN_OVERWRITE;
        }

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
                GatewayIntentBits.GuildScheduledEvents
            ],
            loadMessageCommandListeners: true,
            api: {
                listenOptions: { port: 8080 },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                auth
            },
            makeCache: Options.cacheWithLimits({
                ...Options.DefaultMakeCacheSettings,
                MessageManager: 101 // Note this is 1 more than the amount we fetch at once in database.ts
            }),
            sweepers: {
                ...Options.DefaultSweeperSettings,
                messages: {
                    interval: 300, // Every 5m.
                    lifetime: 300 // Remove messages older than 5 minutes.
                }
            }
        });
        container.events = createEmitter<emitterSpec>();
        container.database = new Database(container.events);
        for (const d of readdirSync(join(this.rootData.root, 'cogs'))) {
            container.logger.info('Registering cog: ' + d);
            this.stores.registerPath(join(this.rootData.root, 'cogs', d));
            const registerPath = join(this.rootData.root, 'cogs', d, 'register.js');
            if (existsSync(registerPath)) setTimeout((_e: unknown) => { import(registerPath).then(()=> {}).catch((e)=> {container.logger.warn(`Error registering ${registerPath}: `, e)}); }, 0)
        }
    }

    public override async login(token?: string): Promise<string> {
        container.guildId = process.env.DISCORD_GUILD_ID;
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
        guildId: string;
    }
}
