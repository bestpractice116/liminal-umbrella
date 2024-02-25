// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import * as colorette from 'colorette';
import { join } from 'node:path';
import { srcDir } from './constants';

import type { IntegerString } from '@skyra/env-utilities';
import { setup } from '@skyra/env-utilities';


declare module '@skyra/env-utilities' {
	interface Env {
		DISCORD_TOKEN: string;
        DISCORD_BOT_TOKEN: string;
        DISCORD_APPLICATION_ID: IntegerString;
        DISCORD_PUBLIC_KEY: string;
	}
}

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup({ path: join(srcDir, '.env') });

// Enable colorette
colorette.createColors({ useColor: true });
