import { DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute } from '@sequelize/core';
import { Index, Attribute, NotNull, Unique, PrimaryKey } from '@sequelize/core/decorators-legacy';
import Message from './Message.js';

export default class GameSession extends Model<InferAttributes<GameSession>, InferCreationAttributes<GameSession>> {
	@Attribute(DataTypes.STRING)
	@NotNull
	@PrimaryKey
	declare id: string;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	declare availableGamesMessageId: string;
	/** Defined by {@link Message.gameSession} */
	declare availableGamesMessage?: NonAttribute<Message>;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	declare eventId: string;

	@Attribute(DataTypes.STRING)
	@Index
	@Unique
	declare channelId: string;
}
