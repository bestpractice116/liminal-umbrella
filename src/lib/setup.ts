// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import * as colorette from 'colorette';
import { join } from 'node:path';
import { srcDir } from './constants.js';

import type { IntegerString } from '@skyra/env-utilities';
import { setup } from '@skyra/env-utilities';


declare module '@skyra/env-utilities' {
	interface Env {
		DISCORD_CLIENT_ID: string;
        DISCORD_CLIENT_SECRET: string;
        DISCORD_BOT_TOKEN: string;
        DISCORD_APPLICATION_ID: IntegerString;
        DISCORD_PUBLIC_KEY: string;
        DISCORD_GUILD_ID: string;
        DATABASE_NAME: string;
	}
}

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup({ path: join(srcDir, '..', 'env') });

// Enable colorette
colorette.createColors({ useColor: true });
