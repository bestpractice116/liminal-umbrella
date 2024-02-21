import {getDiscordSecrets} from '../utils/DiscordSecrets';
import * as Stacks from '../configs/outputs.json';
import { IDiscordSecrets } from '../types';
import {getApplicationCommands, createApplicationCommand, deleteApplicationCommand} from '../utils/DiscordApplicationCommands';

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

async function listCommands(discordSecrets: IDiscordSecrets) {
  const existingCommands = await getApplicationCommands(discordSecrets).catch(console.error) || [];
  for (const command of existingCommands) {
    console.log(command.name + ": " + command.description);
  }
}

async function setupCommands(discordSecrets: IDiscordSecrets) {
  for (const command of commands) {
    await createApplicationCommand(discordSecrets, command).then((foo : any) => {
      console.log(`Created command ${command.name}!`);
    }).catch(console.error);
  }
}

async function resetCommands(discordSecrets: IDiscordSecrets) {
  const existingCommands = await getApplicationCommands(discordSecrets).catch(console.error) || [];
  for (const command of existingCommands) {
    await deleteApplicationCommand(discordSecrets, command.id)
        .then(() => {
          console.log(`Deleted command ${command.name}!`);
        })
        .catch(console.error);
  };
}

getDiscordSecrets(Stacks.LiminalUmbrellaStack.discordSecretName).then(async (discordSecrets : IDiscordSecrets | undefined) : Promise<any> => {
  if (discordSecrets) {
    const inputArgs = process.argv.slice(2);

    switch (inputArgs[0]) {
      case 'list':
        await listCommands(discordSecrets);
        break;
      case 'setup':
        await setupCommands(discordSecrets);
        break;
      case 'reset':
        await resetCommands(discordSecrets)
        break;
    }
  } else {
    console.log('There was a problem retrieving your deployment results.\
    Make sure you\'ve run "npm run deploy" before running this command.');
  }
});
