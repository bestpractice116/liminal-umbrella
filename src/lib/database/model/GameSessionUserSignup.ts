import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from '@sequelize/core';
import { Index, Attribute, NotNull, PrimaryKey, AutoIncrement } from '@sequelize/core/decorators-legacy';

export default class GameSessionUserSignup extends Model<InferAttributes<GameSessionUserSignup>, InferCreationAttributes<GameSessionUserSignup>> {
	@Attribute(DataTypes.INTEGER)
	@AutoIncrement
	@PrimaryKey
	declare key: CreationOptional<number>;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	@Index
	declare gameSessionKey: number;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Index
	declare userKey: string;
}
