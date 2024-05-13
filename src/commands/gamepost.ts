import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Post a game'
})
export class GamePostCommand extends Command {
	/*ublic constructor(context: Command.LoaderContext) {
		super(context, {
			preconditions: ['AdminOnly', 'DMOnly']
		})
	}*/

	// Register Chat Input and Context Menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		container.logger.error(this.name);
		// Register Chat Input command
		registry.registerChatInputCommand((builder) =>
		builder //
		  .setName(this.name)
		  .setDescription('Post a game')
		  /*.addUserOption((option) =>
          	option //
            	.setName('user')
            	.setDescription('User to say hello to')
            	.setRequired(true)
		  )*/
		  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		  .setDMPermission(false)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendTest(interaction);
	}

	private async sendTest(interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction) {
		const row = new ActionRowBuilder<ButtonBuilder>();

		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Ban')
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		row.addComponents(cancel, confirm);

		const pingMessage = await interaction.reply({ content: 'Test?', fetchReply: true, ephemeral: true, components: [row] });

		try {
			const confirmation = await pingMessage.awaitMessageComponent({ time: 60_000 });
			if (confirmation.customId === 'confirm') {
				return interaction.editReply({content: 'confirmed', components: []});
			} else if (confirmation.customId === 'cancel') {
				return confirmation.update({ content: 'Action cancelled', components: [] });
			}
		} catch (e) {
			return interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
		return Promise.resolve();
	}
}
