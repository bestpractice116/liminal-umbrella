import './lib/setup.js';
import { MySapphireClient } from './sapphire.js';

const client = new MySapphireClient();

const main = async () => {
	try {
		client.logger.info('Logging in ' + process.env.DISCORD_BOT_TOKEN);
		await client.login(process.env.DISCORD_BOT_TOKEN);
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
