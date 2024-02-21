import {SecretsManager} from 'aws-sdk';
import {IDiscordSecrets} from '../../types';
import {discordBotAPIKeyName} from '../constants/EnvironmentProps';

console.log("INIT DISCORD SECRETS - TOP");

const secretsManager = new SecretsManager();

console.log("INIT DISCORD SECRETS - BUILT SECRETS MANAGER");

/**
 * Cached Discord secrets so we can reduce warm start times.
 */
let __discordSecrets: IDiscordSecrets | undefined = undefined;

/**
 * Gets the Discord secrets (public key, client ID, etc.) for use in our lambdas.
 *
 * @return {Promise<IDiscordSecrets | undefined>} The Discord secrets to be used.
 */
export async function getDiscordSecrets(): Promise<IDiscordSecrets | undefined> {
  console.log("INIT DISCORD SECRETS - IN getDiscordSecrets");
  if (!__discordSecrets) {
    console.log("INIT DISCORD SECRETS - NO discordSecrets cached");
    try {
      console.log("INIT DISCORD SECRETS - pre getSecretValue");
      const discordApiKeys = await secretsManager.getSecretValue({
        SecretId: discordBotAPIKeyName,
      }).promise();
       console.log("INIT DISCORD SECRETS - post getSecretValue");
      if (discordApiKeys.SecretString) {
        __discordSecrets = JSON.parse(discordApiKeys.SecretString);
      }
    } catch (exception) {
      console.log(`Unable to get Discord secrets: ${exception}`);
    }
  }
  console.log("INIT DISCORD SECRETS - RETURN VALUE");
  return __discordSecrets;
};
