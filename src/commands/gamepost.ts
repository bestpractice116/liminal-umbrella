import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
//import { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';
import { PlannedGame } from '../lib/database/model.js';

@ApplyOptions<Command.Options>({
	description: 'Post a game'
})
export class GamePostCommand extends Command {
	public constructor(context: Command.LoaderContext) {
		super(context, {
			preconditions: ['BetaOnly']
		});
	}

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
				.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
				.setDMPermission(false)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return PlannedGame.runCommand(interaction);
		/*const row = new ActionRowBuilder<ButtonBuilder>();

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
		*/

		/*
		Adventure name: 
Type of Adventure: One shot/Ongoing campaign/Drop in and out campaign (these are the only options)
Game System: DnD 5e, Pathfinder 2e, Cypher System, World of Darkness 5e etc.
Date, day and time of play:  Please put start date for ongoing campaigns.
Location:
Spaces currently available:
DM contact:
Brief description: Max 50 words.  Please give a simple description of the scenario and a brief idea of style of play.  Please include much more detail in your thread or channel.  Do not forget to put a link to your channel. 

*/
	}
}
