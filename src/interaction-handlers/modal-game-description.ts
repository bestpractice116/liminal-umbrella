import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ModalSubmitInteraction } from 'discord.js';
import { PlannedGame } from '../lib/database/model.js';

export class ModalGameDescriptionHandler extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.ModalSubmit
		});
	}

	public override parse(interaction: ModalSubmitInteraction) {
		if (!interaction.isModalSubmit()) return this.none();
		if (interaction.customId !== 'game-description-modal') return this.none();

		const name = interaction.fields.getTextInputValue('name');
		const description = interaction.fields.getTextInputValue('description');

		return this.some({ name, description });
	}

	public async run(interaction: ModalSubmitInteraction, parsedData: InteractionHandler.ParseResult<this>) {
		const { name, description } = parsedData;
		console.log({ name, description });

		const gamerow = await PlannedGame.findGameFromInteraction(interaction);
		gamerow?.set({ name, description });
		gamerow?.save();
		const pingMessage = await gamerow?.showEditForm(interaction);
		return gamerow?.handleEditForm(interaction, pingMessage!);
	}
}
