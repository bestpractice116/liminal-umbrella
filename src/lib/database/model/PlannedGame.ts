///CREATE TABLE IF NOT EXISTS channels (name text, type text, id text, parentId text, position integer, rawPosition integer, createdTimestamp integer, nsfw integer, lastMessageId text, topic text, rateLimitPerUser integer, bitrate integer, rtcRegion text, userLimit integer)")

import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	NonAttribute,
	BelongsToGetAssociationMixin
} from '@sequelize/core';
import { gametypes } from 'common/schema';
import { Attribute, NotNull, PrimaryKey, Index, AutoIncrement, Unique, BelongsTo, DeletedAt } from '@sequelize/core/decorators-legacy';
import GameSystem from './GameSystem.js';
import GameSession from './GameSession.js';
import { Command, container } from '@sapphire/framework';
import {
	userMention,
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ChatInputCommandInteraction,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
	AnySelectMenuInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
	Message,
	StringSelectMenuInteraction,
	ChannelType,
	GuildScheduledEventEntityType,
	GuildScheduledEventPrivacyLevel,
	ThreadAutoArchiveDuration,
	Snowflake,
	TextChannel
} from 'discord.js';
import { gameChannelLink } from '../../discord.js';

export type ReplyableInteraction =
	| ChatInputCommandInteraction
	| MessageContextMenuCommandInteraction
	| UserContextMenuCommandInteraction
	| AnySelectMenuInteraction
	| ButtonInteraction
	| ModalSubmitInteraction
	| StringSelectMenuInteraction;
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
	@AutoIncrement
	@PrimaryKey
	declare key: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Index
	@Unique
	declare owner: string;

	@Attribute(DataTypes.STRING)
	declare name: string | null;

	@BelongsTo(() => GameSystem, 'gamesystem')
	declare gamesystemOb?: NonAttribute<GameSystem>;
	declare getGamesystemOb: BelongsToGetAssociationMixin<GameSystem>;

	@Attribute(DataTypes.INTEGER)
	declare gamesystem: number | null;

	@Attribute(DataTypes.STRING)
	declare type: string | null;

	@Attribute(DataTypes.DATE)
	declare date: Date | null;

	@Attribute(DataTypes.DATE)
	declare starttime: Date | null;

	@Attribute(DataTypes.DATE)
	declare endtime: Date | null;

	@Attribute(DataTypes.INTEGER)
	declare maxplayers: number | null;

	@Attribute(DataTypes.STRING)
	declare description: string | null;

	@Attribute(DataTypes.STRING)
	declare location: string | null;

	@DeletedAt
	declare deletedAt: Date | null;

	async CRUDRead(name: string) {
		if (name == 'gamesystem') {
			if (this.gamesystem) {
				return (await this.getGamesystemOb())!.name;
			}
		}
		return this.get(name);
	}

	async format(): Promise<string> {
		const gs = await this.getGamesystemOb();
		const out = [`Advanture Name: ${this.name}`, `Type: ${gametypes[this.type!]}`];
		if (this.gamesystem) {
			out.push(`Game system: ${gs!.description}`);
		}
		if (this.starttime) {
			const formatter = new Intl.DateTimeFormat('en-UK', { weekday: 'short', month: 'short', day: 'numeric' });
			const d = new Date(this.starttime);
			const startTime = this.starttime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
			const endTime = this.endtime!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
			out.push(`Date, day and time of play: ${formatter.format(d)} ${startTime}-${endTime}`);
		}
		if (this.location) {
			out.push(`Location: ${this.location}`);
		}
		if (this.maxplayers) {
			out.push(`Spaces currently available: ${this.maxplayers}/${this.maxplayers}`);
		}
		out.push(`DM Contact: ${userMention(this.owner)}`);
		out.push(`Brief description: ${this.description}`);
		return out.join('\n');
	}

	static findGameFromInteraction(
		interaction: Command.ChatInputCommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
	): Promise<PlannedGame | null> {
		return this.findOne({
			where: {
				owner: interaction.user.id
			}
		});
	}

	static async runCommand(interaction: Command.ChatInputCommandInteraction) {
		const dbGame = await this.findGameFromInteraction(interaction);
		if (!dbGame) {
			const game = await this.create({
				owner: interaction.user.id,
				gamesystem: 1 // FIXME
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
			.setLabel('Advanture Name')
			.setStyle(TextInputStyle.Short)
			.setMinLength(10)
			.setMaxLength(500)
			.setRequired(true);
		if (this.name) {
			namefield.setValue(this.name);
		}

		const descriptionfield = new TextInputBuilder()
			.setCustomId('description')
			.setLabel('Brief Description')
			.setStyle(TextInputStyle.Paragraph)
			//.setMinLength(100)
			// FIXME
			.setMaxLength(1_500)
			.setRequired(true);
		if (this.description) {
			descriptionfield.setValue(this.description);
		}

		const modal = new ModalBuilder()
			.setCustomId('game-description-modal')
			.setTitle('Describe your Game')
			.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(namefield))
			.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionfield));
		return interaction.showModal(modal);
	}

	async showEditForm(interaction: ReplyableInteraction) {
		const components = [];
		if (!this.gamesystem) {
			const menu = new StringSelectMenuBuilder().setCustomId('post-game-system').setPlaceholder('Game system');
			await GameSystem.addGameSystemOptions(menu);
			components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu));
		}
		if (!this.date) {
			const formatter = new Intl.DateTimeFormat('en-UK', { weekday: 'short', month: 'short', day: 'numeric' });
			const now = new Date();
			const days = Array.from({ length: 25 }, (_, days) => days + 1).map((days) => {
				const then = new Date(now.getTime());
				then.setDate(then.getDate() + days);
				return new StringSelectMenuOptionBuilder()
					.setLabel(then.toISOString().substring(0, 10))
					.setDescription(formatter.format(then))
					.setValue(then.toISOString().substring(0, 10));
			});
			components.push(
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('post-game-date')
						.setPlaceholder('Date')
						.addOptions(...days)
				)
			);
		}

		const row = new ActionRowBuilder<ButtonBuilder>();
		const save = new ButtonBuilder().setCustomId('game-post-do-it').setLabel('Post Game').setStyle(ButtonStyle.Success).setDisabled(true);
		if (this.gamesystem && this.date) {
			save.setDisabled(false);
		}
		row.addComponents(save);
		const discard = new ButtonBuilder().setCustomId('discard').setLabel('Discard Game').setStyle(ButtonStyle.Danger);
		row.addComponents(discard);
		components.push(row);

		return interaction.reply({ content: await this.format(), fetchReply: true, ephemeral: true, components });
	}

	async postGame(): Promise<number> {
		const db = await container.database.getdb();
		let channelId: string | undefined;
		let gameListingsMessageId: string | undefined;
		let eventId: string | undefined;
		try {
			return await db.transaction(async () => {
				channelId = await this.createGameThread();
				gameListingsMessageId = await this.postGameListing();
				eventId = await this.postEvent(channelId);
				const session = await GameSession.create({
					owner: this.owner,
					gameListingsMessageId,
					eventId,
					channelId,
					name: this.name!,
					gamesystem: this.gamesystem!,
					type: this.type!,
					starttime: this.starttime!,
					endtime: this.endtime!,
					maxplayers: this.maxplayers!,
					signed_up_players: 0,
					description: this.description!,
					location: this.location!
				});
				await this.destroy();
				return session.key;
			});
		} catch (e) {
			console.log(`Caught error posting Game: ${e}`);
			if (channelId) {
				const channel = container.client.channels.cache.find((channel) => channel.id === channelId);
				await channel?.delete();
			}
			if (gameListingsMessageId) {
				const channel = this.getGameListingChannel();
				const msg = await channel?.messages.fetch(gameListingsMessageId);
				await msg?.delete();
			}
			if (eventId) {
				const event = container.guild?.scheduledEvents.cache.find((event) => event.id === eventId);
				await event?.delete();
			}
			throw e;
		}
	}

	async postEvent(channelId: Snowflake): Promise<Snowflake> {
		const event = await container.guild?.scheduledEvents.create({
			description: this.description!,
			entityType: GuildScheduledEventEntityType.External,
			name: this.name!,
			scheduledStartTime: this.starttime!,
			scheduledEndTime: this.endtime!,
			privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
			entityMetadata: {
				location: gameChannelLink(channelId)
			}
		});
		return event!.id;
	}

	getGameListingChannel(): TextChannel | undefined {
		const channel_name = 'game_listings';
		const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channel_name);
		if (channel && channel.type == ChannelType.GuildText) {
			return channel;
		}
		return undefined;
	}

	async postGameListing(): Promise<Snowflake> {
		const channel = this.getGameListingChannel();
		if (channel && channel.type == ChannelType.GuildText) {
			const msg = await channel.send(await this.format());
			return msg.id;
		}
		throw new Error('Could not find game_listings channel');
	}

	async createGameThread(): Promise<Snowflake> {
		const channel_name = 'one_shots';
		const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildForum && channel.name === channel_name);
		if (channel && channel.type == ChannelType.GuildForum) {
			const thread = await channel.threads.create({
				name: this.name!,
				autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
				message: {
					content: await this.format()
				},
				reason: `Game: ${this.name!} by ${userMention(this.owner)}`
			});
			return thread.id;
		}
		throw new Error('Could not find one_shots channel');
	}

	async handleEditForm(interaction: ReplyableInteraction, msg: Message) {
		const input = await msg.awaitMessageComponent();
		if (input.customId === 'discard') {
			//const confirm = await this.getConfirmInput(msg);
			//if (confirm) {
			await this.destroy();
			return interaction.editReply({ content: 'Game deleted', components: [] });
			//} else {
			//    return this.showEditForm(interaction);
			//}
		}
		if (input.customId === 'game-post-do-it') {
			await this.postGame();
			/*const confirm = await this.getConfirmInput(msg);
            if (confirm) {
                return interaction.editReply({content: 'Game posted', components: []});
            } else {
                return this.showEditForm(interaction);
            }*/
		}
		console.log('INPUT CUSTOM ID ' + input.customId);
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
