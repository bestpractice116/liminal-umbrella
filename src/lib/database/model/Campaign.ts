///CREATE TABLE IF NOT EXISTS channels (name text, type text, id text, parentId text, position integer, rawPosition integer, createdTimestamp integer, nsfw integer, lastMessageId text, topic text, rateLimitPerUser integer, bitrate integer, rtcRegion text, userLimit integer)")

import { DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute, BelongsToGetAssociationMixin } from '@sequelize/core';
import { Attribute, BelongsTo, NotNull, PrimaryKey, Unique } from '@sequelize/core/decorators-legacy';
import User from './User.js';
//import Role from './Role.js';
import GameSystem from './GameSystem.js';

export default class Campaign extends Model<InferAttributes<Campaign>, InferCreationAttributes<Campaign>> {
    @Attribute(DataTypes.STRING)
    @NotNull
    @PrimaryKey
    declare key: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare dmUser: string;

    @BelongsTo(() => User, 'dmUser')
    declare dmUserOb?: NonAttribute<User>;
    declare getDmUserOb: BelongsToGetAssociationMixin<User>;

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare roleKey: string;

    //@BelongsTo(() => Role, 'role')
    //declare roleOb?: NonAttribute<Role>;
    //declare getRoleOb: BelongsToGetAssociationMixin<Role>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare gamesystemKey: string;

    declare gamesystem?: NonAttribute<GameSystem>;
    declare getGamesystem: BelongsToGetAssociationMixin<GameSystem>;
}
