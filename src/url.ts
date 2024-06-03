// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const rootDir = join(__dirname, '..');
export const srcDir = join(rootDir, 'src');

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
        GREET_USERS_CHANNEL: string | undefined;
    }
}

// Read env var
setup({ path: join(srcDir, '..', 'env') });

const DiscordOauthURL = `https://discord.com/oauth2/authorize`;

export const oauthURL = new URL(DiscordOauthURL);
oauthURL.search = new URLSearchParams([
  ['redirect_uri', 'http://127.0.0.1:8080/oauth/authorize'],
  ['response_type', 'code'],
  ['scope', ['identify'].join(' ')],
  ['client_id', process.env.DISCORD_APPLICATION_ID]
]).toString();

console.log(oauthURL.toString());
