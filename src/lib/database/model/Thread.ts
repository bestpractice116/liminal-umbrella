///CREATE TABLE IF NOT EXISTS channels (name text, type text, id text, parentId text, position integer, rawPosition integer, createdTimestamp integer, nsfw integer, lastMessageId text, topic text, rateLimitPerUser integer, bitrate integer, rtcRegion text, userLimit integer)")

import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey } from '@sequelize/core/decorators-legacy';

export default class Thread extends Model<InferAttributes<Thread>, InferCreationAttributes<Thread>> {
    @Attribute(DataTypes.STRING)
    @NotNull
    @PrimaryKey
    declare key: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare parentId: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare archived: boolean;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare archiveTimestamp: number;

    @Attribute(DataTypes.BOOLEAN)
    declare locked: boolean;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare createdTimestamp: number;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare lastMessageId?: string;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare lastSeenIndexedToDate: Date;
}
