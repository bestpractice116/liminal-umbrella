import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey, Table, Unique  } from '@sequelize/core/decorators-legacy';

export enum ActivityType {
    Playing = 'playing',
    Steaming = 'streaming',
    Listening = 'listening',
    Watching = 'watching',
  }

@Table({ tableName: 'activities' })
export default class Activity extends Model<InferAttributes<Activity>, InferCreationAttributes<Activity>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    declare id: number | null;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Unique
    declare name: string;

    @Attribute(DataTypes.ENUM('playing', 'streaming', 'listening', 'watching'))
    @NotNull
    declare type: ActivityType;
}