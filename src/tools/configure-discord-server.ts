import {DiscordInteractions, PartialApplicationCommand} from 'slash-commands';
import {getDiscordSecrets} from '../utils/DiscordSecrets';
import * as Stacks from '../configs/outputs.json';
import { IDiscordSecrets } from '../types';

const commands = [
  {
    name: 'hello-world',
    description: 'A simple hello command to test.',
  },
  /*{
    name: 'verify',
    description: 'Verify your Oculus handle. You must have a valid Oculus Start role!',
    options: [
      {
        name: 'oculus_handle',
        description: 'Your Oculus handle. Make sure this \
        matches what you registered with Oculus Start!',
        type: 3,
        required: true,
      },
    ],
  },*/
];

console.log(Stacks.LiminalUmbrellaStack.discordSecretName);
getDiscordSecrets(Stacks.LiminalUmbrellaStack.discordSecretName).then(async (discordSecrets : IDiscordSecrets | undefined) : Promise<any> => {
  if (discordSecrets) {
    const interaction = new DiscordInteractions({
      applicationId: discordSecrets.applicationId,
      authToken: discordSecrets.authToken,
      publicKey: discordSecrets.publicKey,
    });

    const inputArgs = process.argv.slice(2);

    switch (inputArgs[0]) {
      case 'setup':
        for (const command of commands) {
          await interaction.createApplicationCommand(command).then(() => {
            console.log(`Created command ${command.name}!`);
          }).catch(console.log);
        }
        break;
      case 'reset':
        const existingCommands = await interaction.getApplicationCommands();
        for (const command of existingCommands) {
          await interaction
              .deleteApplicationCommand(command.id)
              .then(() => {
                console.log(`Deleted command ${command.name}!`);
              })
              .catch(console.error);
        };
        break;
    }
  } else {
    console.log('There was a problem retrieving your deployment results.\
    Make sure you\'ve run "npm run deploy" before running this command.');
  }
});
