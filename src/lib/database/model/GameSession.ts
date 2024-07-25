import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	NonAttribute,
	CreationOptional,
	BelongsToGetAssociationMixin,
	BelongsToManyGetAssociationsMixin,
	BelongsToManySetAssociationsMixin,
	BelongsToManyAddAssociationMixin,
	BelongsToManyAddAssociationsMixin,
	BelongsToManyRemoveAssociationMixin,
	BelongsToManyRemoveAssociationsMixin,
	BelongsToManyCountAssociationsMixin,
	BelongsToManyHasAssociationMixin,
	BelongsToManyHasAssociationsMixin
} from '@sequelize/core';
import {
	Index,
	Attribute,
	NotNull,
	Unique,
	PrimaryKey,
	AutoIncrement,
	BelongsTo,
	Default,
	DeletedAt,
	BelongsToMany
} from '@sequelize/core/decorators-legacy';
import GameSystem from './GameSystem.js';
import User from './User.js';
import { container } from '@sapphire/framework';
import { getGameListingChannel, format, getOneShotsChannel } from '../../discord.js';
import dayjs from '../../dayjs.js';

export default class GameSession extends Model<InferAttributes<GameSession>, InferCreationAttributes<GameSession>> {
	@Attribute(DataTypes.INTEGER)
	@AutoIncrement
	@PrimaryKey
	declare key: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Index
	declare owner: string;

	@BelongsTo(() => User, 'owner')
	declare ownerOb?: NonAttribute<User>;
	declare getOwnerOb: BelongsToGetAssociationMixin<User>;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	@NotNull
	declare gameListingsMessageId: string;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	@NotNull
	declare eventId: string;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	@NotNull
	declare channelId: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare name: string;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare gamesystem: number;

	@BelongsTo(() => GameSystem, 'gamesystem')
	declare gamesystemOb?: NonAttribute<GameSystem>;
	declare getGamesystemOb: BelongsToGetAssociationMixin<GameSystem>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare type: string;

	@Attribute(DataTypes.DATE)
	@NotNull
	declare starttime: Date;

	@Attribute(DataTypes.DATE)
	@NotNull
	declare endtime: Date;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare maxplayers: number;

	@Attribute(DataTypes.INTEGER)
	@Default(0)
	@NotNull
	declare signed_up_players: number;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare description: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare location: string;

	@DeletedAt
	declare deletedAt: Date | null;

	@BelongsToMany(() => User, {
		through: 'GameSessionUserSignup',
		inverse: {
			as: 'signedupGameSessions'
		}
	})
	declare signedupUsers?: NonAttribute<User[]>;
	declare getSignedupUsers: BelongsToManyGetAssociationsMixin<User>;
	declare setSignedupUsers: BelongsToManySetAssociationsMixin<User, User['key']>;
	declare addSignedupUser: BelongsToManyAddAssociationMixin<User, User['key']>;
	declare addSignedupUsers: BelongsToManyAddAssociationsMixin<User, User['key']>;
	declare removeSignedupUser: BelongsToManyRemoveAssociationMixin<User, User['key']>;
	declare removeSignedupUsers: BelongsToManyRemoveAssociationsMixin<User, User['key']>;
	declare hasSignedupUser: BelongsToManyHasAssociationMixin<User, User['key']>;
	declare hasSignedupUsers: BelongsToManyHasAssociationsMixin<User, User['key']>;
	declare countSignedupUsers: BelongsToManyCountAssociationsMixin<User>;

	async CRUDRead(name: string) {
		if (name == 'gamesystem') {
			if (this.gamesystem) {
				return (await this.getGamesystemOb())!.name;
			}
		}
		if (name == 'signedupplayers') {
			return (await this.getSignedupUsers()).map((user: User) => {
				return { key: user.key, nickname: user.nickname, avatarURL: user.avatarURL, username: user.username };
			});
		}
		if (name == 'owner') {
			const user = await this.getOwnerOb();
			return { key: user!.key, nickname: user!.nickname, avatarURL: user!.avatarURL, username: user!.username };
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

	async getGameThread() {
		const channel = await getOneShotsChannel();
		if (!channel) return null;
		return (await channel.threads.fetch(this.channelId)) || null;
	}

	async updateGameThread() {
		const thread = await this.getGameThread();
		if (!thread) return;
		const starttime = dayjs(this.starttime);
		const endtime = dayjs(this.endtime);
		const name = `${this.name} (${starttime.format('DD/MM/YYYY HH:mm')}-${endtime.format('HH:mm')})`;
		if (name !== thread.name) {
			await thread.setName(name);
		}
		const firstMessage = await thread.fetchStarterMessage();
		if (!firstMessage) return;
		if (this.description !== firstMessage.content) {
			await firstMessage.edit(this.description);
		}
	}

	async addMemberToGameThread(id: string) {
		const thread = await this.getGameThread();
		if (!thread) return;
		await thread.members.add(id);
	}

	async removeMemberFromGameThread(id: string) {
		const thread = await this.getGameThread();
		if (!thread) return;
		await thread.members.remove(id);
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
