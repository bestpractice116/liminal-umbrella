import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	NonAttribute,
	CreationOptional,
	BelongsToGetAssociationMixin
} from '@sequelize/core';
import { Index, Attribute, NotNull, Unique, PrimaryKey, AutoIncrement, BelongsTo, Default } from '@sequelize/core/decorators-legacy';
import Message from './Message.js';
import GameSystem from './GameSystem.js';

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
	declare name: string | null;

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
}
