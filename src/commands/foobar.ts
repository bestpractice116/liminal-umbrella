import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'test test'
})
export class TestCommand extends Command {
	// Register Chat Input and Context Menu command
	public override registerApplicationCommands(_: Command.Registry) {
		// Register Chat Input command
		/*registry.registerChatInputCommand((builder) =>
		builder //
		  .setName(this.name)
		  .setDescription(this.description)
		  .addUserOption((option) =>
          	option //
            	.setName('user')
            	.setDescription('User to say hello to')
            	.setRequired(true)
		  )
		);*/

		// Register Context Menu command available from any message
		/*registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.Message
		});*/

		// Register Context Menu command available from any user
		/*registry.registerContextMenuCommand({
			name: this.name,
			type: ApplicationCommandType.User
		});*/
	}

	// Message command
	public override async messageRun(message: Message) {
		return this.sendTest(message);
	}

	// Chat Input (slash) command
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendTest(interaction);
	}

	// Context Menu command
	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.sendTest(interaction);
	}

	private async sendTest(interactionOrMessage: Message | Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction) {
		const pingMessage =
			interactionOrMessage instanceof Message
				? await interactionOrMessage.channel.send({ content: 'Test?' })
				: await interactionOrMessage.reply({ content: 'Test?', fetchReply: true });

		const content = `tseT! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			pingMessage.createdTimestamp - interactionOrMessage.createdTimestamp
		}ms.`;

		if (interactionOrMessage instanceof Message) {
			return pingMessage.edit({ content });
		}

		return interactionOrMessage.editReply({
			content
		});
	}
}
