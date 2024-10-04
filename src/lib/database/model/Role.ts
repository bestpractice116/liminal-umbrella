//CREATE TABLE IF NOT EXISTS roles (id text, name text, createdTimestamp integer, hoist integer, mentionable integer, tags string, position integer, rawPosition integer, hexColor text, unicodeEmoji text, icon text, permissions text)

import { DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute } from '@sequelize/core';
import { Attribute, HasOne, NotNull, PrimaryKey } from '@sequelize/core/decorators-legacy';
import User from './User.js';
import Campaign from './Campaign.js';

export default class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
	@Attribute(DataTypes.STRING)
	@NotNull
	@PrimaryKey
	declare key: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare name: string;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	declare mentionable: boolean;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare tags: string;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare position: number;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare rawPosition: number;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare hexColor: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare unicodeEmoji: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare permissions: string;

	declare users?: NonAttribute<User[]>;

	static async rolesMap(): Promise<Map<string, Role>> {
		const out = new Map();
		const roles = await Role.findAll();
		for (const role of roles) {
			out.set(role.key, role);
		}
		return out;
	}

	@HasOne(() => Campaign, /* foreign key */ 'role')
	declare campaign?: NonAttribute<Campaign>;
}
