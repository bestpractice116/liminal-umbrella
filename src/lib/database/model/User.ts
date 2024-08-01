import {
	DataTypes,
	Model,
	InferAttributes,
	InferCreationAttributes,
	NonAttribute,
	BelongsToManySetAssociationsMixin,
	BelongsToManyAddAssociationsMixin,
	BelongsToManyRemoveAssociationsMixin,
	BelongsToManyHasAssociationMixin,
	BelongsToManyHasAssociationsMixin,
	BelongsToManyCountAssociationsMixin,
	HasManyGetAssociationsMixin
} from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, BelongsToMany, HasMany } from '@sequelize/core/decorators-legacy';
import Role from './Role.js';
import RoleMember from './RoleMember.js';
import PlannedGame from './PlannedGame.js';
import GameSession from './GameSession.js';
import EventInterest from './EventInterest.js';

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	@Attribute(DataTypes.STRING)
	@PrimaryKey
	@NotNull
	declare key: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare name: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare username: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare nickname: string;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	declare rulesaccepted: boolean;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	declare bot: boolean;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	declare left: boolean;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare avatarURL: string;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare joinedDiscordAt: number;

	@BelongsToMany(() => Role, {
		through: () => RoleMember
	})
	declare roles?: NonAttribute<Role[]>;
	declare setRoles: BelongsToManySetAssociationsMixin<Role, Role['key']>;
	declare addRoles: BelongsToManyAddAssociationsMixin<Role, Role['key']>;
	declare removeRoles: BelongsToManyRemoveAssociationsMixin<Role, Role['key']>;
	declare hasRole: BelongsToManyHasAssociationMixin<Role, Role['key']>;
	declare hasRoles: BelongsToManyHasAssociationsMixin<Role, Role['key']>;
	declare countRoles: BelongsToManyCountAssociationsMixin<Role>;

	@HasMany(() => EventInterest, /* foreign key */ 'userId')
	declare eventInterest: NonAttribute<EventInterest>;
	declare getEventInterests: HasManyGetAssociationsMixin<EventInterest>;

	async CRUDRead(key: string) {
		if (key === 'roles') {
			return ((await this.roles) || []).map((role: Role) => ({
				name: role.name,
				hexColor: role.hexColor,
				position: role.rawPosition
			}));
		}
		return this.get(key);
	}

	@HasMany(() => PlannedGame, /* foreign key */ 'owner')
	declare plannedGames?: NonAttribute<PlannedGame>;
	declare getPlannedGames: HasManyGetAssociationsMixin<PlannedGame>;

	declare signedupGameSessions: NonAttribute<GameSession[]>;
	declare getSignedupGameSessions: HasManyGetAssociationsMixin<GameSession>;

	static async activeUsersMap(): Promise<Map<string, User>> {
		const out = new Map();
		for (const user of await this.findAll({ where: { left: false }, include: ['roles'] })) {
			out.set(user.key, user);
		}
		return out;
	}
}
