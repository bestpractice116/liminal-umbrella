import './lib/setup.js';
import { MySapphireClient } from './sapphire.js';

const client = new MySapphireClient();

const main = async () => {
	try {
		await client.login(process.env.DISCORD_BOT_TOKEN);
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
