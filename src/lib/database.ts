import { Sequelize, importModels, DataTypes, TransactionType, Op, CreationAttributes } from '@sequelize/core';
import { container } from '@sapphire/framework';
import { Umzug, SequelizeStorage } from 'umzug';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type {
    TextChannel,
    TextBasedChannel,
    Guild,
    FetchMessagesOptions,
    FetchArchivedThreadOptions,
    Message as DiscordMessage,
    NonThreadGuildBasedChannel,
    GuildScheduledEvent,
    User as GuildUser,
    Role as GuildRole,
    AnyThreadChannel,
    GuildChannel,
} from 'discord.js';
import { ChannelType, GuildBasedChannel, MessageType, GuildMember } from 'discord.js';
import { User, Role, Channel, Message, Watermark, EventInterest, GameSessionUserSignup, Thread } from './database/model.js';
import { TypedEvent } from '../lib/typedEvents.js';
import {
    UserJoined,
    UserLeft,
    UserChangedNickname,
    MessageUpdated,
    MessageAdded,
    UserInterestedInEvent,
    UserDisinterestedInEvent
} from './events/index.js';
import GreetingMessage from './database/model/GreetingMessage.js';
import { arrayStrictEquals } from '@sapphire/utilities';
import { Sequential, sleep } from './utils.js';
import { CUSTOM_EVENTS } from './events.js';
import { getGuildMemberById } from './discord.js';
import { END_OF_TIME, isStartOfTime, START_OF_TIME } from './dates.js';

interface ChannelData {
    name: string
    type: string
    parentId?: string
    position: number
    rawPosition: number
    createdTimestamp: number
    nsfw?: boolean
    lastMessageId?: string
    topic?: string
    rateLimitPerUser?: number
}

interface RoleData {
    name: string
    mentionable: boolean
    tags: string
    position: number
    rawPosition: number
    hexColor: string
    unicodeEmoji: string
    permissions: string
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        throw new Error(`${value} is not defined`);
    }
}

export const DATABASE_FILENAME = process.env.DATABASE_NAME.startsWith('/')
    ? process.env.DATABASE_NAME
    : path.join(__dirname, '..', '..', process.env.DATABASE_NAME);

type ThreadMeta = Record<string, string | number | boolean | Date | undefined>;

export default class Database {
    db: Sequelize | undefined;

    events: TypedEvent;

    highwatermark: number;

    syncedChannels: Set<string>;

    indexedChannels: Set<string>;

    usersLastSeen: Map<string, Date>;

    constructor(e: TypedEvent) {
        this.events = e;
        this.highwatermark = 0;
        this.syncedChannels = new Set<string>();
        this.indexedChannels = new Set<string>();
        this.usersLastSeen = new Map<string, Date>();
    }

    indexChannel(id: string) {
        this.indexedChannels.add(id);
    }

    async getdb(): Promise<Sequelize> {
        const storage = DATABASE_FILENAME;

        if (this.db) {
            return this.db;
        }

        const log = process.env.NODE_ENV === 'development' || !!process.env.LOG_QUERIES;

        this.db = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: log ? (msg) => { container.logger.debug(msg); } : false,
            storage,
            models: await importModels(__dirname + '/database/model/*.js'),
            transactionType: TransactionType.EXCLUSIVE,
            retry: {
                match: [/SQLITE_BUSY/],
                name: 'query',
                max: 10
            }
        });

        return this.db;
    }

    async doMigrations(guild: Guild) {
        const umzug = new Umzug({
            migrations: {
                glob: ['migrations/*.js', { cwd: path.join(path.dirname(import.meta.url.replace('file://', '')), '..', '..', 'dist') }]
            },
            context: {
                sequelize: await this.getdb(),
                guild,
                DataTypes
            },
            storage: new SequelizeStorage({
                sequelize: await this.getdb()
            }),
            logger: console
        });
        return umzug.up();
    }

    async greetingMessageAdd(message: DiscordMessage, user: User): Promise<void> {
        await GreetingMessage.findOrCreate({
            where: { userId: user.key },
            defaults: { userId: user.key, messageId: message.id }
        });
        await user.updateLastSeenFromMessage(message);
    }

    getRoleData(role: GuildRole): RoleData {
        return {
            name: role.name,
            mentionable: role.mentionable,
            tags: JSON.stringify(role.tags ?? []) || '',
            position: role.position,
            rawPosition: role.rawPosition,
            hexColor: role.hexColor,
            unicodeEmoji: role.unicodeEmoji ?? '',
            permissions: JSON.stringify(role.permissions.serialize())
        };
    }

    async syncRoles(guild: Guild): Promise<void> {
        const roles = await guild.roles.fetch();
        const dbRoles = await Role.rolesMap();
        const missingRoles = [];
        for (const [key, role] of roles) {
            const dbRole = dbRoles.get(key);
            if (!dbRole) {
                missingRoles.push(key);
            } else {
                await this.roleUpdate(role, dbRole);
            }
            dbRoles.delete(key);
        }
        for (const missingId of missingRoles) {
            const role = roles.get(missingId)!;
            await this.roleCreate(role);
        }
        for (const [_key, dbRole] of dbRoles) {
            await this.roleDelete(undefined, dbRole);
        }
    }

    async roleCreate(role: GuildRole) {
         
        await Role.create({
            key: role.id,
            ...this.getRoleData(role)
        });
    }

    async roleDelete(role?: GuildRole  , dbRole?: Role  ) {
        if (!dbRole && !role) {
            throw new Error('Must supply either discord Guildrole or DB role as parameter');
        }
        if (!dbRole) dbRole = (await Role.findByPk(role!.id)) ?? undefined;
        if (!dbRole) return;
        await dbRole.destroy();
    }

    async roleUpdate(role: GuildRole, dbRole?: Role  ) {
        if (!dbRole) dbRole = (await Role.findByPk(role.id)) ?? undefined;
        if (!dbRole) return this.roleCreate(role);
        dbRole.set(this.getRoleData(role));
        await dbRole.save();
    }

    async guildMemberAdd(guildMember: GuildMember) {
        let user = await User.findByPk(guildMember.id);
        let exMember = true;
        if (!user) {
            user = await User.createFromGuildMember(guildMember);
            exMember = false;
        } else {
            user.updateFromGuildMember(guildMember);
            await user.save();
        }
        await user.setRoles(guildMember.roles.cache.keys());
        if (this.highwatermark == 0) {
            // Skip these events if we are bootstrapping - to avoid us spamming channels with repeated user joined / welcome messages.
            return;
        }
        if (!guildMember.user.bot) {
            this.events.emit(
                'userJoined',
                new UserJoined(user.key, user.username, user.name, user.nickname, exMember, user.avatarURL, new Date(user.joinedDiscordAt), user)
            );
            await this.maybeSetHighestWatermark();
        }
    }

    async guildMemberUpdate(guildMember: GuildMember, user: User | null = null) {
        user ||= await User.findByPk(guildMember.id);
        if (!user) {
            return;
        }
        let changed = false;
        const newNick = ((guildMember.nickname ?? guildMember.user.globalName) ?? guildMember.user.username);
        if (newNick != user.nickname) {
            this.events.emit('userChangedNickname', new UserChangedNickname(guildMember.id, user.nickname, newNick, user, guildMember));
            user.nickname = newNick;
            changed = true;
        }
        const newAvatar = guildMember.user.avatarURL() ?? guildMember.user.defaultAvatarURL;
        if (newAvatar != user.avatarURL) {
            user.avatarURL = newAvatar;
            changed = true;
        }
        // TODO - remove if (isStartOfTime(user.joinedDiscordAt)) once run
        if (isStartOfTime(user.joinedDiscordAt)) {
            user.joinedDiscordAt = guildMember.user.createdAt;
            changed = true;
        }
        if (isStartOfTime(user.joinedGuildAt) && guildMember.joinedAt) {
            user.joinedGuildAt = guildMember.joinedAt;
            changed = true;
        }
        if (!arrayStrictEquals(Array.from(guildMember.roles.cache.keys()).sort(), (user.roles || []).map((role) => role.name).sort())) {
            await user.setRoles(guildMember.roles.cache.keys());
        }
        if (changed) {
            await user.save();
        }
        await this.maybeSetHighestWatermark();
    }

    async guildMemberRemove(id: string, member: User | null = null) {
        if (!member) {
            member = await User.findByPk(id);
        }
        if (!member) {
            return;
        }
        member.left = true;
        const previousRoles = (await member.getRoles()).map(role => role.name);
        member.previousRoles = JSON.stringify(previousRoles);
        await member.save();
        await member.setRoles([]);
        const eventInterests = await EventInterest.findAll({
            where: {
                userId: id
            }
        });
        for (const eventInterest of eventInterests) {
            await eventInterest.destroy();
        }
        const sessions = await GameSessionUserSignup.findAll({
            where: {
                userKey: id
            }
        });
        for (const session of sessions) {
            // FIXME - also need to call updateGameListing
            await session.destroy();
        }
        let greetingMessageId: string | undefined = undefined;
        const greeting = await GreetingMessage.findOne({ where: { userId: id } });
        if (greeting) {
            greetingMessageId = greeting.messageId;
            await greeting.destroy();
        }
        this.events.emit(
            'userLeft',
            new UserLeft(
                id,
                member.username,
                member.name,
                member.nickname,
                member.avatarURL,
                member.joinedDiscordAt,
                member,
                greetingMessageId
            )
        );
        await this.maybeSetHighestWatermark();
    }

    async syncUsers(guild: Guild) {
        const members = await guild.members.fetch();
        const dbusers = await User.activeUsersMap();
        const missingMembers = [];
        for (const [id, guildMember] of members) {
            const dbMember = dbusers.get(id);
            if (!dbMember) {
                missingMembers.push(id);
            } else {
                await this.guildMemberUpdate(guildMember, dbMember);
                if (
                    JSON.stringify(Array.from(guildMember.roles.cache.keys()).sort()) !=
                    JSON.stringify((dbMember.roles || []).map((role) => role.key).sort())
                ) {
                    await dbMember.setRoles(guildMember.roles.cache.keys());
                }
            }
            dbusers.delete(id);
        }
        for (const missingId of missingMembers) {
            const guildMember = members.get(missingId)!;
            await this.guildMemberAdd(guildMember);
        }
        for (const [id, dbMember] of dbusers) {
            await this.guildMemberRemove(id, dbMember);
        }
    }

    getChannelData(guildChannel: NonThreadGuildBasedChannel): ChannelData {
        const data: ChannelData = {
            name: guildChannel.name,
            type: guildChannel.type.toString(),
            parentId: guildChannel.parentId ?? undefined,
            position: guildChannel.position,
            rawPosition: guildChannel.rawPosition,
            createdTimestamp: guildChannel.createdTimestamp
        }
        if (
            guildChannel.type == ChannelType.GuildText ||
            guildChannel.type == ChannelType.GuildAnnouncement ||
            guildChannel.type == ChannelType.GuildForum
        ) {
            const chan = guildChannel as TextChannel;
            data.nsfw = chan.nsfw;
            data.lastMessageId = chan.lastMessageId ?? undefined;
            data.topic = chan.topic ?? undefined;
            data.rateLimitPerUser = chan.rateLimitPerUser;
        }

        return data;
    }

    async channelUpdate(channel: NonThreadGuildBasedChannel) {
        const dbChannel = await Channel.findOne({ where: { id: channel.id } });
        dbChannel!.set(this.getChannelData(channel));
        await dbChannel!.save();
    }

    async channelCreate(channel: NonThreadGuildBasedChannel) {
        await Channel.create({
            id: channel.id,
            ...this.getChannelData(channel),
            synced: false,
            lastSeenIndexedToDate: START_OF_TIME
        });
    }

    async channelDelete(channel: GuildChannel) {
        const dbChannel = await Channel.findByPk(channel.id);
        if (!dbChannel) return;
        await dbChannel.destroy();
    }

    async syncChannels(guild: Guild) {
        const channels = (await guild.channels.fetch()).filter(
            (channel) =>
                channel?.type == ChannelType.GuildText ||
                channel?.type == ChannelType.GuildCategory ||
                channel?.type == ChannelType.GuildAnnouncement ||
                channel?.type == ChannelType.GuildForum
        );
        const dbchannels = await Channel.channelsMap();
        const missingChannels = [];
        for (const [id, guildChannel] of channels) {
            const dbChannel = dbchannels.get(id);
            if (!dbChannel) {
                missingChannels.push(id);
            } else {
                dbChannel.set(this.getChannelData(guildChannel));
                await dbChannel.save();
            }
            dbchannels.delete(id);
        }
        for (const missingId of missingChannels) {
            const guildChannel = channels.get(missingId)!;
            await this.channelCreate(guildChannel);
        }
        for (const [_, dbChannel] of dbchannels) {
            await dbChannel.destroy();
        }
    }

    async indexChannels(guild: Guild) {
        const channels = await Channel.findAll();
        for (const channel of channels) {
            const guildChannel = await guild.channels.fetch(channel.id);
            await this.syncChannel(guildChannel!);
        }
        console.log('FINISHED INDEXING ALL CHANNELS');
    }

    async sync(guild: Guild): Promise<void> {
        await this.syncRoles(guild);
        await this.syncUsers(guild);
        await this.syncChannels(guild);
        await this.syncEvents(guild);
    }

    async getHighestWatermark() {
        const mark = await Watermark.findOne({ order: [['time', 'DESC']] });
        if (mark) {
            this.highwatermark = mark.time;
        }
    }

    // This logic here is that if the watermark in the database is > 10 seconds old we automatically set it to now - 5 seconds.
    // This 5 seconds should allow for delays and etc meaning that we don't see Discord events for some time after they happen or if getting
    // stuff committed to the database takes a while.
    // The 10 seconds should mean that if a bunch of stuff happens in a fairly short space of time, we don't repeatedly hammer the
    // dataabase with repeated watermark updates.
    // Also note - that we don't update the watermark at all if it's 0 - this means that we don't write the watermark when we are
    // bootstrapping with an empty database.
    async maybeSetHighestWatermark() {
        if (this.highwatermark == 0) {
            return;
        }
        const now = Date.now();
        const maxwatermark = now - 1000 * 5;
        const minwatermark = now - 1000 * 10;
        if (this.highwatermark < minwatermark) {
            return this.setHighestWatermark(maxwatermark);
        }
    }

    async setHighestWatermark(watermark: number) {
            await Watermark.create({ time: watermark });
            await Watermark.destroy({
                where: { time: { [Op.lt]: watermark } }
            });
        this.highwatermark = watermark;
        return Promise.resolve();
    }

    async getdiscordChannel(guild: Guild, channelName: string): Promise<GuildBasedChannel> {
        const channel = await Channel.findOne({ where: { name: channelName } });
        assertIsDefined(channel);
        const discordChannel = await guild.channels.fetch(channel.id);
        assertIsDefined(discordChannel);
        return discordChannel;
    }

    async deleteMessage(msg: DiscordMessage) {
        const dbMessage = await Message.findOne({ where: { id: msg.id } });
        if (dbMessage) await dbMessage.destroy();
    }

    async indexMessage(msg: DiscordMessage) {
        if (!this.usersLastSeen.has(msg.author.id) || (this.usersLastSeen.get(msg.author.id) || START_OF_TIME) < msg.createdAt) {
            const user = await User.findOne({ where: { key: msg.author.id } });
            if (user && !user.bot) {
                await user.updateLastSeenFromMessage(msg);
            }
            this.usersLastSeen.set(msg.author.id, msg.createdAt);
        }
        if (!this.indexedChannels.has(msg.channel.id)) {
            return;
        }
        const dbMessage = await Message.findOne({ where: { id: msg.id } });
        if (dbMessage) {
            if (
                (!dbMessage.editedTimestamp && msg.editedTimestamp) ||
                (dbMessage.editedTimestamp && dbMessage.editedTimestamp < msg.editedTimestamp!) ||
                dbMessage.hasThread != msg.hasThread ||
                dbMessage.pinned != msg.pinned
            ) {
                dbMessage.content = msg.content;
                dbMessage.editedTimestamp = msg.editedTimestamp;
                dbMessage.hasThread = msg.hasThread;
                if (dbMessage.hasThread) {
                    dbMessage.threadId = msg.thread?.id ?? null;
                }
                dbMessage.embedCount = msg.embeds.length;
                dbMessage.pinned = msg.pinned;
                await dbMessage.save();
                this.events.emit('messageUpdated', new MessageUpdated(msg, dbMessage));
            }
        } else {
            const dbMessage = await Message.create({
                id: msg.id,
                authorId: msg.author.id,
                channelId: msg.channel.id,
                applicationId: msg.applicationId ?? '',
                type: MessageType[msg.type],
                content: msg.content,
                createdTimestamp: msg.createdTimestamp,
                editedTimestamp: msg.editedTimestamp,
                hasThread: msg.hasThread,
                threadId: msg.thread?.id,
                embedCount: msg.embeds.length,
                pinned: msg.pinned
            });
            this.events.emit('messageAdded', new MessageAdded(msg, dbMessage));
        }
    }

    async fetchAndStoreMessages(channel: TextBasedChannel, earliest?: Date): Promise<Date> {
        const fetchAmount = 100;
        const options: FetchMessagesOptions = {
            limit: fetchAmount
        };
        earliest ||= START_OF_TIME;
        let earliestDateSeen = END_OF_TIME;
        let latestDateSeen = START_OF_TIME;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const messages = await channel.messages.fetch(options);
            await sleep(100);

            if (messages.size > 0) {
                for (const pairs of messages) {
                    const msg = pairs[1];
                    const createdTimestamp = new Date(msg.createdTimestamp);

                    if (createdTimestamp < earliestDateSeen) {
                        earliestDateSeen = new Date(msg.createdTimestamp);
                        options.before = msg.id;
                    }
                    if (createdTimestamp > latestDateSeen) {
                        latestDateSeen = new Date(msg.createdTimestamp);
                    }
                    await this.indexMessage(msg);
                }
            }

            if (messages.size < fetchAmount || earliestDateSeen <= earliest) {
                break;
            }
        }
        return latestDateSeen;
    }

    @Sequential
    async syncChannel(discordChannel: GuildBasedChannel) {
        // We only need to sync each channel once!
        if (this.syncedChannels.has(discordChannel.id)) {
            return;
        }
        const doIndex = this.indexedChannels.has(discordChannel.id);
        if (discordChannel.type === ChannelType.GuildText) {
            this.syncedChannels.add(discordChannel.id);
            const channel = await Channel.findByPk(discordChannel.id);
            if (!channel) throw new Error(`Could not find discord channel ID ${discordChannel.id} in DB`);
            let earliest = START_OF_TIME;
            if (channel.synced) {
                earliest = channel.lastSeenIndexedToDate;
            }
                const lastSeenIndexedToDate = await this.fetchAndStoreMessages(discordChannel, earliest);
                channel.set({ lastSeenIndexedToDate, synced: true });
                await channel.save();
        }
        if (discordChannel.type === ChannelType.PublicThread || discordChannel.type === ChannelType.PrivateThread) {
            throw new Error(`We should not end up in syncChannel for a thread ID ${discordChannel.id}`);
        }
        if (discordChannel.type === ChannelType.GuildForum || discordChannel.type === ChannelType.GuildText) {
            const fetchArchivedOptions: FetchArchivedThreadOptions = {
                fetchAll: true,
                limit: 100
            };
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            while (true) {
                const archivedThreads = await discordChannel.threads.fetchArchived(fetchArchivedOptions);
                await sleep(100);

                for (const [_name, thread] of archivedThreads.threads) {
                    this.syncedChannels.add(thread.id);
                    if (doIndex) this.indexedChannels.add(thread.id);
                    await this.syncThread(thread);
                }

                if (!archivedThreads.hasMore) {
                    break;
                }
                fetchArchivedOptions.before = archivedThreads.threads.first()!.id;
            }

            // No need to do extra stuff with active threads, as fetchActive() just always returns them all
            const activeThreads = await discordChannel.threads.fetchActive();
            for (const [_name, thread] of activeThreads.threads) {
                this.syncedChannels.add(thread.id);
                if (doIndex) this.indexedChannels.add(thread.id);
                await this.syncThread(thread);
            }    
        }
    }

    async syncThread(thread: AnyThreadChannel) {
            const dbThread = await Thread.findByPk(thread.id);
            if (
                dbThread &&
                dbThread.locked == thread.locked &&
                dbThread.archived == thread.archived &&
                thread.archiveTimestamp == dbThread.archiveTimestamp
            ) {
                return;
            }
            let earliest = START_OF_TIME;
            if (dbThread) {
                earliest = dbThread.lastSeenIndexedToDate;
            }
            if (!dbThread || dbThread.archiveTimestamp !== thread.archiveTimestamp || dbThread.lastMessageId !== thread.lastMessageId) {
                earliest = await this.fetchAndStoreMessages(thread, earliest);
            }
            const threadMetadata: ThreadMeta = {
                name: thread.name,
                parentId: thread.parentId!,
                archived: thread.archived!,
                archiveTimestamp: thread.archiveTimestamp!,
                locked: thread.locked!,
                createdTimestamp: thread.createdTimestamp!,
                lastMessageId: thread.lastMessageId ?? undefined,
                lastSeenIndexedToDate: earliest
            };
            if (!dbThread) {
                const data: ThreadMeta = { key: thread.id, ...threadMetadata };
                await Thread.create(data as CreationAttributes<Thread>);
            } else {
                if (Object.keys(threadMetadata).some((key) => threadMetadata[key] !== dbThread.get(key))) {
                    dbThread.set(threadMetadata);
                    await dbThread.save();
                }
            }
    }

    // Catch up on any users interested
    async syncEvents(guild: Guild) {
        const allEvents = await guild.scheduledEvents.fetch();
        for (const guildScheduledEvent of allEvents.values()) {
            const subscribers = await guildScheduledEvent.fetchSubscribers();
            for (const subscriber of subscribers.values()) {
                await this.addUserInterestedInEvent(subscriber.user, guildScheduledEvent);
            }
            const uninteresteds = await EventInterest.findAll({
                where: {
                    userId: { [Op.notIn]: Array.from(subscribers.keys()) },
                    guildScheduledEventId: guildScheduledEvent.id
                }
            });
            for (const uninterested of uninteresteds) {
                const member = await getGuildMemberById(uninterested.userId);
                if (member) {
                    await this.removeUserInterestedInEvent(member.user, guildScheduledEvent);
                } else {
                    await uninterested.destroy();
                }
            }
        }
    }

    async addUserInterestedInEvent(user: GuildUser, guildScheduledEvent: GuildScheduledEvent) {
        const [eventInterest, created] = await EventInterest.findOrCreate({
            where: { userId: user.id, guildScheduledEventId: guildScheduledEvent.id },
            defaults: {
                userId: user.id,
                guildScheduledEventId: guildScheduledEvent.id
            }
        });
        if (!created) return;
        this.events.emit(
            CUSTOM_EVENTS.UserInterestedInEvent,
            new UserInterestedInEvent(guildScheduledEvent.id, guildScheduledEvent, user.id, user, eventInterest)
        );
    }

    async removeUserInterestedInEvent(user: GuildUser, guildScheduledEvent: GuildScheduledEvent) {
        const eventInterest = await EventInterest.findOne({
            where: {
                userId: user.id,
                guildScheduledEventId: guildScheduledEvent.id
            }
        });
        if (!eventInterest) return;
        await eventInterest.destroy();
        this.events.emit(
            CUSTOM_EVENTS.UserDisinterestedInEvent,
            new UserDisinterestedInEvent(guildScheduledEvent.id, guildScheduledEvent, user.id, user, eventInterest)
        );
    }
}
