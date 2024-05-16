import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ModalSubmitInteraction } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

export class HelloModalHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    });
  }

  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== 'hello-popup') return this.none();

    if (!interaction.isModalSubmit()) return this.none();

    const name = interaction.fields.getTextInputValue('name');
    const description = interaction.fields.getTextInputValue('description');

    return this.some({ name, description });
  }

  public async run(interaction: ModalSubmitInteraction, parsedData: InteractionHandler.ParseResult<this>) {
    const {name, description} = parsedData;
    console.log({ name, description });

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
    const game = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
      .setCustomId('game')
      .setPlaceholder('Game system')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('dnd5e')
          .setDescription('DnD 5e')
          .setValue('dnd5e'),
        new StringSelectMenuOptionBuilder()
          .setLabel('pathfinder')
          .setDescription('Pathfinder 2e')
          .setValue('pathfinder'),
        new StringSelectMenuOptionBuilder()
          .setLabel('alien')
          .setDescription('Alien')
          .setValue('alien'),
      )
    );
    const month = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
      .setCustomId('month')
      .setPlaceholder('Month')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('5')
          .setDescription('May')
          .setValue('5'),
        new StringSelectMenuOptionBuilder()
          .setLabel('6')
          .setDescription('June')
          .setValue('6'),
      )
    );
    const day = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
      .setCustomId('day')
      .setPlaceholder('Date')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('16')
          .setDescription('16')
          .setValue('16'),
        new StringSelectMenuOptionBuilder()
          .setLabel('17')
          .setDescription('17')
          .setValue('17'),
        new StringSelectMenuOptionBuilder()
          .setLabel('18')
          .setDescription('18')
          .setValue('18'),
      )
    );

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

		const pingMessage = await interaction.reply({ content: 'Test?', fetchReply: true, ephemeral: true, components: [game, month, day, row] });

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
