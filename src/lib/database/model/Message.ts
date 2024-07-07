import { DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute } from '@sequelize/core';
import { HasOne, Attribute, NotNull, PrimaryKey, Index } from '@sequelize/core/decorators-legacy';
import GameSession from './GameSession.js';

export default class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
	@Attribute(DataTypes.STRING)
	@NotNull
	@PrimaryKey
	declare id: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare authorId: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Index
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

	@Attribute(DataTypes.BIGINT)
	@NotNull
	declare createdTimestamp: number;

	@Attribute(DataTypes.BIGINT)
	declare editedTimestamp: number | null;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	declare hasThread: boolean;

	@Attribute(DataTypes.STRING)
	declare threadId: string | null;

	@Attribute(DataTypes.BIGINT)
	@NotNull
	declare embedCount: number;

	@Attribute(DataTypes.BOOLEAN)
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

	@HasOne(() => GameSession, /* foreign key */ 'channelId')
	declare gameSession?: NonAttribute<GameSession>;
}
