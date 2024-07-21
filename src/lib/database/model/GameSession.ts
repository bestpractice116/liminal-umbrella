import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	NonAttribute,
	CreationOptional,
	BelongsToGetAssociationMixin
} from '@sequelize/core';
import { Index, Attribute, NotNull, Unique, PrimaryKey, AutoIncrement, BelongsTo, Default, DeletedAt } from '@sequelize/core/decorators-legacy';
import Message from './Message.js';
import GameSystem from './GameSystem.js';
import { container } from '@sapphire/framework';
import { getGameListingChannel, format, getOneShotsChannel } from '../../discord.js';

export default class GameSession extends Model<InferAttributes<GameSession>, InferCreationAttributes<GameSession>> {
	@Attribute(DataTypes.INTEGER)
	@AutoIncrement
	@PrimaryKey
	declare key: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Index
	declare owner: string;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	declare gameListingsMessageId: string;
	/** Defined by {@link Message.gameSession} */
	declare gameListingsMessage?: NonAttribute<Message>;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	declare eventId: string;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	declare channelId: string;

	@Attribute(DataTypes.STRING)
	declare name: string;

	@BelongsTo(() => GameSystem, 'gamesystem')
	declare gamesystemOb?: NonAttribute<GameSystem>;
	declare getGamesystemOb: BelongsToGetAssociationMixin<GameSystem>;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare gamesystem: number;

	@Attribute(DataTypes.STRING)
	declare type: string;

	@Attribute(DataTypes.DATE)
	declare starttime: Date;

	@Attribute(DataTypes.DATE)
	declare endtime: Date;

	@Attribute(DataTypes.INTEGER)
	declare maxplayers: number;

	@Attribute(DataTypes.INTEGER)
	@Default(0)
	@NotNull
	declare signed_up_players: number;

	@Attribute(DataTypes.STRING)
	declare description: string;

	@Attribute(DataTypes.STRING)
	declare location: string;

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

	async CRUDSave() {
		const db = await container.database.getdb();
		return db.transaction(async () => {
			await this.updateGameThread();
			await this.updateGameListing();
			await this.updateEvent();
			return this.save();
		});
	}

	async updateGameThread() {
		const channel = await getOneShotsChannel();
		if (!channel) return;
		const thread = await channel.threads.fetch(this.channelId);
		if (!thread) return;
		if (this.name !== thread.name) {
			await thread.setName(this.name);
		}
		const firstMessage = await thread.fetchStarterMessage();
		if (!firstMessage) return;
		if (this.description !== firstMessage.content) {
			await firstMessage.edit(this.description);
		}
	}

	async updateGameListing() {
		const channel = getGameListingChannel();
		const message = await channel?.messages.fetch(this.gameListingsMessageId);
		if (!message) return;
		const newContents = await format(this);
		if (newContents !== message?.content) {
			await message.edit(newContents);
		}
	}
	async updateEvent() {
		const event = await container.guild?.scheduledEvents.fetch(this.get('eventId'));
		if (!event) return;
		await event.edit({ name: this.name, description: this.description, scheduledStartTime: this.starttime, scheduledEndTime: this.endtime });
	}
}
