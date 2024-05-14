import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ModalSubmitInteraction } from 'discord.js';

export class HelloModalHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    });
  }

  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== 'hello-popup') return this.none();

    return this.some();
  }

  public async run(interaction: ModalSubmitInteraction) {
    await interaction.reply({
      content: 'Thank you for submitting the form!',
      ephemeral: true
    });
  }
}
