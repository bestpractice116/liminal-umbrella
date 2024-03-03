
import { DataTypes, Model, InferAttributes, InferCreationAttributes} from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey  } from '@sequelize/core/decorators-legacy';

export default class Channel extends Model<InferAttributes<Channel>, InferCreationAttributes<Channel>> {
    @Attribute(DataTypes.STRING)
    @NotNull
    @PrimaryKey
    declare id: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare authorId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare channelId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare applicationId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare type: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare content: string;

    @Attribute(DataTypes. BIGINT)
    @NotNull
    declare createdTimestamp: number;

    @Attribute(DataTypes. BIGINT)
    @NotNull
    declare editedTimestamp: number;

    @Attribute(DataTypes. BOOLEAN)
    @NotNull
    declare hasThread: boolean;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare threadId: string;

    @Attribute(DataTypes. BIGINT)
    @NotNull
    declare embedCount: number;

    @Attribute(DataTypes. BOOLEAN)
    @NotNull
    declare pinned: boolean;
/*
    @Attribute(DataTypes. BOOLEAN)
    @NotNull
    declare system: boolean;

    @Attribute(DataTypes. BOOLEAN)
    @NotNull
    declare tts: boolean;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare activity: string;

    @Attribute(DataTypes. BIGINT)
    @NotNull
    declare attachmentCount: number;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare referenceChannelId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare referenceGuildId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare referenceMessageId: string;*/
}