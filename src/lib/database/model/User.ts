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
import { Attribute, PrimaryKey, NotNull, BelongsToMany, HasMany, HasOne } from '@sequelize/core/decorators-legacy';
import Role from './Role.js';
import RoleMember from './RoleMember.js';
import PlannedGame from './PlannedGame.js';
import GameSession from './GameSession.js';
import EventInterest from './EventInterest.js';
import GreetingMessage from './GreetingMessage.js';
import { ChannelType, GuildMember, Message } from 'discord.js';
import Campaign from './Campaign.js';
import CampaignPlayer from './CampaignPlayer.js';
import { START_OF_TIME } from '../../dates.js';
import { container } from '@sapphire/framework';

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

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare kicked: boolean;

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

    CRUDRead(key: string) {
        if (key === 'roles') {
            return (this.roles ?? []).map((role: Role) => ({
                name: role.name,
                hexColor: role.hexColor,
                position: role.rawPosition
            }));
        }
        if (key === 'lastSeenLink') return this.lastSeenLink()
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

    @HasOne(() => GreetingMessage, /* foreign key */ 'userId')
    declare greetingMessage?: NonAttribute<GreetingMessage>;

    static userDataFromGuildMember(guildMember: GuildMember) {
        return {
            nickname: ((guildMember.nickname ?? guildMember.user.globalName) ?? guildMember.user.username),
            username: guildMember.user.username,
            name: (guildMember.user.globalName ?? guildMember.user.username),
            rulesaccepted: false, // FIXME
            left: false,
            bot: guildMember.user.bot,
            avatarURL: guildMember.user.avatarURL() ?? guildMember.user.defaultAvatarURL,
            joinedDiscordAt: guildMember.user.createdAt.valueOf(),
            kicked: false
        };
    }

    static createFromGuildMember(guildMember: GuildMember): Promise<User> {
        return User.create({
            key: guildMember.id,
            ...User.userDataFromGuildMember(guildMember),
            lastSeenTime: START_OF_TIME,
            lastSeenMessage: 'unknown'
        });
    }

    updateFromGuildMember(guildMember: GuildMember) {
        this.set({
            ...User.userDataFromGuildMember(guildMember)
        });
    }

    // FIXME - running
    @HasMany(() => Campaign, /* foreign key */ 'dmUser')
    declare campaignsRunning?: NonAttribute<PlannedGame>;
    declare getCampaignsRunning: HasManyGetAssociationsMixin<Campaign>;

    @BelongsToMany(() => Campaign, {
        through: () => CampaignPlayer
    })
    declare campaignsPlaying?: NonAttribute<Campaign[]>;
    declare setCampaignsPlaying?: BelongsToManySetAssociationsMixin<Campaign, Campaign['key']>;
    declare addCampaignsPlaying: BelongsToManyAddAssociationsMixin<Campaign, Campaign['key']>;
    declare removeCampaignsPlaying: BelongsToManyRemoveAssociationsMixin<Campaign, Campaign['key']>;
    declare hasCampaignPlaying: BelongsToManyHasAssociationMixin<Campaign, Campaign['key']>;
    declare countCampaignsPlaying: BelongsToManyCountAssociationsMixin<Campaign>;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare lastSeenTime: Date;

    @Attribute(DataTypes.STRING)
    declare lastSeenChannel?: string;

    @Attribute(DataTypes.STRING)
    declare lastSeenThread?: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare lastSeenMessage: string;

    updateLastSeenFromMessage(message: Message) {
        if (message.createdAt < this.lastSeenTime) return;
        let lastSeenThread = null;
        let lastSeenChannel = message.channel.id
        if (message.channel.type === ChannelType.PublicThread) {
            lastSeenChannel = message.channel.parent!.id
            lastSeenThread = message.channel.id
        }
        const messageLink = lastSeenThread ? `https://discord.com/channels/${container.guildId}/${lastSeenThread}/${message.id}` : `https://discord.com/channels/${container.guildId}/${message.channelId}/${message.id}` 
        console.log(`updateLastSeenFromMessage for user ${this.nickname} (${this.key}) to channelId ${message.channelId} msgId ${message.id} (${messageLink}) from ${this.lastSeenTime} to ${message.createdAt}`);
        const updates: Record<string, string | null | Date > = {
            lastSeenTime: message.createdAt,
            lastSeenMessage: message.id,
            lastSeenThread,
            lastSeenChannel
        };
        this.set(updates);
        return this.save();
    }

    lastSeenLink() {
        if (this.lastSeenThread) return `https://discord.com/channels/${container.guildId}/${this.lastSeenThread}/${this.lastSeenMessage}`;
        if (this.lastSeenChannel) return `https://discord.com/channels/${container.guildId}/${this.lastSeenChannel}/${this.lastSeenMessage}`;
        return;
    }
}
