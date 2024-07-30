import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	NonAttribute,
	BelongsToGetAssociationMixin,
	CreationOptional
} from '@sequelize/core';
import { Attribute, AutoIncrement, PrimaryKey, Index } from '@sequelize/core/decorators-legacy';
import User from './User.js';
import GameSession from './GameSession.js';

export default class EventInterest extends Model<InferAttributes<EventInterest>, InferCreationAttributes<EventInterest>> {
	@Attribute(DataTypes.INTEGER)
	@AutoIncrement
	@PrimaryKey
	declare key: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@Index
	declare guildScheduledEventId: string;

	/** Defined by {@link GameSession.eventId} */
	declare gameSession?: NonAttribute<GameSession>;
	declare getGameSession: BelongsToGetAssociationMixin<GameSession>;

	@Attribute(DataTypes.STRING)
	@Index
	declare userId: string;

	/** Defined by {@link User.key} */
	declare user?: NonAttribute<User>;
}
