import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
    BelongsToGetAssociationMixin
} from '@sequelize/core';
import { Index, Attribute, NotNull, PrimaryKey, AutoIncrement } from '@sequelize/core/decorators-legacy';
import GameSession from './GameSession.js';
import User from './User.js';

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

    declare signedupGameSession: NonAttribute<GameSession>;
    declare getSignedupGameSession: BelongsToGetAssociationMixin<GameSession>;
    declare signedupUser?: NonAttribute<User>;
    declare getSignedupUser: BelongsToGetAssociationMixin<User>;
}
