import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { StringSelectMenuInteraction } from 'discord.js';
import { PlannedGame } from '../lib/database/model.js';

export class SelectsPostGamenHandler extends InteractionHandler {
    public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.MessageComponent
        });
    }

    public override parse(interaction: StringSelectMenuInteraction) {
        for (const fieldName of ['post-game-system', 'post-game-date']) {
            if (interaction.customId == fieldName) {
                return this.some();
            }
        }
        return this.none();
    }

    public async run(interaction: StringSelectMenuInteraction) {
        const gamerow = await PlannedGame.findGameFromInteraction(interaction);
        if (interaction.customId == 'post-game-system') {
            //gamerow?.set({ gamesystem: Number(interaction.values[0]) });
        }
        if (interaction.customId == 'post-game-date') {
            gamerow?.set({ starttime: new Date(interaction.values[0]) });
        }
        await gamerow?.save();
        const pingMessage = await gamerow?.showEditForm(interaction);
        return gamerow?.handleEditForm(interaction, pingMessage!);
    }
}
