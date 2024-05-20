///CREATE TABLE IF NOT EXISTS channels (name text, type text, id text, parentId text, position integer, rawPosition integer, createdTimestamp integer, nsfw integer, lastMessageId text, topic text, rateLimitPerUser integer, bitrate integer, rtcRegion text, userLimit integer)")

import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey, Index, AutoIncrement, Unique } from '@sequelize/core/decorators-legacy';
import { Command, container } from '@sapphire/framework';
import {
    userMention, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,
    ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    ChatInputCommandInteraction, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction,
    AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction,
    Message, StringSelectMenuInteraction, ChannelType, GuildScheduledEventEntityType,
    GuildScheduledEventPrivacyLevel, ThreadAutoArchiveDuration
    } from 'discord.js';


export type ReplyableInteraction = ChatInputCommandInteraction | MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction | AnySelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
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

export default class PlannedGame extends Model<InferAttributes<PlannedGame>, InferCreationAttributes<PlannedGame>> {
    @Attribute(DataTypes.INTEGER)
    @NotNull
    @AutoIncrement
    @PrimaryKey
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Index
    @Unique
    declare owner: string;

    @Attribute(DataTypes.STRING)
    declare name: string | null;

    @Attribute(DataTypes.STRING)
    declare system: string | null;

    @Attribute(DataTypes.STRING)
    declare datetime: string | null;

    @Attribute(DataTypes.INTEGER)
    declare max_players: number | null;

    @Attribute(DataTypes.STRING)
    declare description: string | null;

    format() : string {
        const out = [`Advanture Name: ${this.name}`, `Type: One shot`];
        if (this.system) {
            out.push(`Game system: ${this.system}`);
        }
        if (this.datetime) {
            out.push(`Date, day and time of play: ${this.datetime}`); // FIXME format
        }
        // FIXME - add location
        // FIXME - add spaces available/taken
        if (this.max_players) {
            out.push(`Spaces currently available: ?/${this.max_players}`);
        }
        out.push(`DM Contact: ${userMention(this.owner)}`);
        out.push(`Brief description: ${this.description}`);
        return out.join("\n");
    }

    static findGameFromInteraction(interaction: Command.ChatInputCommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction): Promise<PlannedGame | null> {
        return this.findOne({
			where: {
				owner: interaction.user.id,
			},
		})
    }

    static async runCommand(interaction: Command.ChatInputCommandInteraction) {
        const dbGame = await this.findGameFromInteraction(interaction);
        console.log(`LOOKING FOR GAME ${dbGame}`)
        if (!dbGame) {
            const game = await this.create({
                owner: interaction.user.id,
              });
            return game.showDescriptionModal(interaction);
        } else {
            const msg = await dbGame.showEditForm(interaction);
            return dbGame.handleEditForm(interaction, msg);
        }
    }

    showDescriptionModal(interaction: Command.ChatInputCommandInteraction) {
        const namefield = new TextInputBuilder()
            .setCustomId('name')
            .setLabel("Advanture Name")
            .setStyle(TextInputStyle.Short)
            .setMinLength(10)
            .setMaxLength(500)
            .setRequired(true);
        if (this.name) {
            namefield.setValue(this.name);
        }

        const descriptionfield = new TextInputBuilder()
            .setCustomId('description')
            .setLabel("Brief Description")
            .setStyle(TextInputStyle.Paragraph)
            //.setMinLength(100)
            .setMaxLength(1_500)
            .setRequired(true);
        if (this.description) {
            descriptionfield.setValue(this.description);
        }

        const modal = new ModalBuilder()
        .setCustomId('game-description-modal')
        .setTitle('Describe your Game')
        .addComponents(
            (new ActionRowBuilder<TextInputBuilder>()).addComponents(namefield)
        ).addComponents(
            (new ActionRowBuilder<TextInputBuilder>()).addComponents(descriptionfield)
        );
        return interaction.showModal(modal);
    }

    showEditForm(interaction: ReplyableInteraction) {
        const components = [];
        if (!this.system) {
            components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('post-game-system')
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
            ));
        }
        if (!this.datetime) {
            components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('post-game-month')
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
            ));
            components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('post-game-day')
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
            ));
        }

        const row = new ActionRowBuilder<ButtonBuilder>();
        const save = new ButtonBuilder()
                .setCustomId('game-post-do-it')
                .setLabel('Post Game')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true);
        if (this.system && this.datetime) {
            save.setDisabled(false);
        }
        row.addComponents(save);
        const discard = new ButtonBuilder()
                .setCustomId('discard')
                .setLabel('Discard Game')
                .setStyle(ButtonStyle.Danger);
        row.addComponents(discard);
        components.push(row);

        return interaction.reply({ content: this.format(), fetchReply: true, ephemeral: true, components});
    }

    async postGame(interaction: ReplyableInteraction) {
        await this.postGameListing();
        await this.postEvent(interaction);
        await this.createGameThread();
    }

    async postEvent(interaction: ReplyableInteraction) {
        await interaction.guild?.scheduledEvents.create({
            description: this.description!,
            entityType: GuildScheduledEventEntityType.External,
            name: this.name!,
            scheduledStartTime: new Date(Date.now()+1000000),
            scheduledEndTime: new Date(Date.now()+1000000+(1000*60*60)), // 1hr
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityMetadata: {
                location: 'FIXME'
            }
        });
    }

    async postGameListing() {
        const channel_name = 'game_listings';
        const channel = container.client.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.name === channel_name);
        if (channel && channel.type == ChannelType.GuildText) {
            await channel.send(this.format());
        }
    }

    async createGameThread() {
        const channel_name = 'one_shots';
        const channel = container.client.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.name === channel_name);
        if (channel && channel.type == ChannelType.GuildForum) {
            await channel.threads.create({
                name: 'Food Talk',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                message: {
                    content: this.format(),
                },
                reason: 'Needed a thread for a game',
            });
        } else {
            console.log(`Could not find channel: ${channel_name}`);
        }
    }

    async handleEditForm(interaction: ReplyableInteraction, msg: Message) {
        console.log("HANDLE EDIT FORM");
        const input  = await msg.awaitMessageComponent();
        console.log("GOT MESSAGE");
        if (input.customId === 'discard') {
            //const confirm = await this.getConfirmInput(msg);
            //if (confirm) {
                await this.destroy();
                return interaction.editReply({content: 'Game deleted', components: []});
            //} else {
            //    return this.showEditForm(interaction);
            //}
        }
        if (input.customId === 'game-post-do-it') {
            await this.postGame(interaction);
            /*const confirm = await this.getConfirmInput(msg);
            if (confirm) {
                return interaction.editReply({content: 'Game posted', components: []});
            } else {
                return this.showEditForm(interaction);
            }*/
        }
        console.log("INPUT CUSTOM ID "+ input.customId);
        /*
        try {
			const confirmation = await msg.awaitMessageComponent({ time: 60_000 });
			if (confirmation.customId === 'confirm') {
				return interaction.editReply({content: 'confirmed', components: []});
			} else if (confirmation.customId === 'discard') {
                await this.destroy();
				return confirmation.update({ content: 'Game removed', components: [] });
			}
		} catch (e) {
			return interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
        return Promise.resolve();*/
        return Promise.resolve();
    }

    async getConfirmInput(msg: Message) {
        try {
            const confirmation = await msg.awaitMessageComponent({ time: 60_000 });
            if (confirmation.customId === 'confirm') {
				return true;
			} else if (confirmation.customId === 'cancel') {
                return false;
			}
        } catch {
            return false;
        }
        return false;
    }
}
