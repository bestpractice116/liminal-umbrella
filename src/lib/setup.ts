// Unless explicitly defined, set NODE_ENV as development:
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import * as colorette from 'colorette';
import { join } from 'node:path';
import { ROOT_DIR } from './constants.js';

import type { IntegerString } from '@skyra/env-utilities';
import { setup } from '@skyra/env-utilities';

declare module '@skyra/env-utilities' {
    interface Env {
        DISCORD_BOT_TOKEN: string;
        DISCORD_APPLICATION_ID: IntegerString;
        DISCORD_PUBLIC_KEY: string;
        DISCORD_GUILD_ID: string;
        DISCORD_OAUTH_CLIENT_SECRET: string;
        DATABASE_NAME: string;
        GREET_USERS_CHANNEL: string | undefined;
    }
}

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup({ path: join(ROOT_DIR, 'env') });

// Enable colorette
colorette.createColors({ useColor: true });
