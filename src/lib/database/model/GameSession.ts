import { DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional } from '@sequelize/core';
import { Index, Attribute, NotNull, Unique, PrimaryKey, AutoIncrement } from '@sequelize/core/decorators-legacy';
import Message from './Message.js';

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
}
