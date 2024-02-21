import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import {IDiscordSecrets} from '../types';

const secretsManager = new SecretsManagerClient();

/**
 * Cached Discord secrets so we can reduce warm start times.
 */
let __discordSecrets: IDiscordSecrets | undefined = undefined;

/**
 * Gets the Discord secrets (public key, client ID, etc.) for use in our lambdas.
 *
 * @return {Promise<IDiscordSecrets | undefined>} The Discord secrets to be used.
 */
export async function getDiscordSecrets(discordBotAPIKeyName: string = process.env['DISCORD_BOT_API_KEY_NAME'] ?? 'unknown'): Promise<IDiscordSecrets | undefined> {
  if (!__discordSecrets) {
    try {
      const discordApiKeys = await secretsManager.send(
        new GetSecretValueCommand({
          SecretId: discordBotAPIKeyName,
        }),
      );
      if (discordApiKeys.SecretString) {
        __discordSecrets = JSON.parse(discordApiKeys.SecretString);
      }
    } catch (exception) {
      console.log(`Unable to get Discord secrets: ${exception}`);
    }
  }
  return __discordSecrets;
};
