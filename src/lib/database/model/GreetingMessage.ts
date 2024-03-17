
import { DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute } from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey, Index, Unique, HasOne } from '@sequelize/core/decorators-legacy';
import User from './User.js';

export default class GreetingMessage extends Model<InferAttributes<GreetingMessage>, InferCreationAttributes<GreetingMessage>> {
    @Attribute(DataTypes.STRING)
    @NotNull
    @PrimaryKey
    declare messageId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Unique
    @Index
    declare userId: string;

    @HasOne(() => User, /* foreign key */ 'id')
    declare user: NonAttribute<User>;
}