///CREATE TABLE IF NOT EXISTS channels (name text, type text, id text, parentId text, position integer, rawPosition integer, createdTimestamp integer, nsfw integer, lastMessageId text, topic text, rateLimitPerUser integer, bitrate integer, rtcRegion text, userLimit integer)")

import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, NotNull, PrimaryKey } from '@sequelize/core/decorators-legacy';

export default class Channel extends Model<InferAttributes<Channel>, InferCreationAttributes<Channel>> {
	@Attribute(DataTypes.STRING)
	@NotNull
	@PrimaryKey
	declare id: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	// FIXME UNIQUE
	// FIXME INDEX
	declare name: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare type: string;

	@Attribute(DataTypes.STRING)
	declare parentId: string | null;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare position: number;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare rawPosition: number;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare createdTimestamp: number;

	/*@Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare nsfw: boolean;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare lastMessageId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare topic: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare rateLimitPerUser: bigint;
*/

	@Attribute(DataTypes.DATE)
	@NotNull
	declare lastSeenIndexedToDate: Date;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	declare synced: boolean;

	static async channelsMap(): Promise<Map<string, Channel>> {
		const out = new Map();
		for (const channel of await this.findAll()) {
			out.set(channel.id, channel);
		}
		return out;
	}
}
