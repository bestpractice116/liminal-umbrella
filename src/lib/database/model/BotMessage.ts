import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Unique  } from '@sequelize/core/decorators-legacy';

export default class BotMessage extends Model<InferAttributes<BotMessage>, InferCreationAttributes<BotMessage>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare key: number | null;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Unique
    declare name: string;

    @Attribute(DataTypes.TEXT)
    @NotNull
    declare value: string;
}