import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { ActivityType } from 'common/schema';

@Table({ tableName: 'activities' })
export default class Activity extends Model<InferAttributes<Activity>, InferCreationAttributes<Activity>> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@AutoIncrement
	declare key: number | null;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Unique
	declare name: string;

	@Attribute(DataTypes.ENUM('playing', 'streaming', 'listening', 'watching'))
	@NotNull
	declare type: ActivityType;
}
