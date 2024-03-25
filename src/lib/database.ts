
import { Sequelize, importModels, TransactionType, Op } from '@sequelize/core';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { TextChannel, TextBasedChannel, CategoryChannel, Guild, FetchMessagesOptions, Message as DiscordMessage } from 'discord.js';
import { ChannelType, GuildBasedChannel, MessageType, GuildMember } from 'discord.js';
import { User, Role, Channel, Message, Watermark } from './database/model.js';
import {TypedEvent} from '../lib/typedEvents.js';
import {UserJoined, UserLeft, UserChangedNickname} from '../lib/events/index.js';
import GreetingMessage from './database/model/GreetingMessage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        throw new Error(`${value} is not defined`)
    }
}

async function sleep(time : number) {
	return new Promise(resolve => setTimeout(resolve, time));
}

export default class Database {
    db: Sequelize | undefined;

    events: TypedEvent;

    highwatermark: number

    constructor(e: TypedEvent) {
        this.events = e;
        this.highwatermark = 0;
    }

    async getdb() : Promise<Sequelize> {
        const storage = process.env.DATABASE_NAME.startsWith('/') ? process.env.DATABASE_NAME : path.join(__dirname, '..', '..', process.env.DATABASE_NAME)

        if (this.db) {
            return this.db;
        }

        this.db = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: process.env.NODE_ENV === 'development',
            storage,
            models: await importModels(__dirname + '/database/model/*.js'),
            transactionType: TransactionType.IMMEDIATE,
            retry: {
                match: [
                  /SQLITE_BUSY/,
                ],
                name: 'query',
                max: 5
            },
        });
        await this.db!.sync();
        await this.getHighestWatermark();
        return this.db
    }

    async greetingMessageAdd(messageId: string, userId: string) : Promise<void> {
        await GreetingMessage.findOrCreate({
            where: { userId },
            defaults: { userId, messageId },
          });
    }

    async syncRoles(guild : Guild) : Promise<void> {
        const roles = await guild.roles.fetch();
        const dbRoles = await Role.rolesMap();
        const missingRoles = [];
        for (const [id, _] of roles) {
            const dbRole = dbRoles.get(id);
            if (!dbRole) {
                missingRoles.push(id);
            }
            dbRoles.delete(id);
        }
        for (const missingId of missingRoles) {
            const role = roles.get(missingId)!;
            await Role.create({
                id: missingId,
                name: role.name,
                mentionable: role.mentionable,
                tags: JSON.stringify(role.tags||[]) || '',
                position: role.position,
                rawPosition: role.rawPosition,
                hexColor: role.hexColor,
                unicodeEmoji: role.unicodeEmoji || '',
                permissions: JSON.stringify(role.permissions.serialize()),
            });
        }
        for (const [id, _] of dbRoles) {
            const role = await Role.findByPk(id);
            await role?.destroy();
        }
    }

    async guildMemberAdd(guildMember: GuildMember) {
        const userData = {
            nickname: (guildMember.nickname || guildMember.user.globalName || guildMember.user.username)!,
            username: (guildMember.user.globalName || guildMember.user.username)!,
            rulesaccepted: false, // FIXME
            left: false,
        };
        let user = await User.findByPk(guildMember.id);
        let exMember = true;
        if (!user) {
            user = await User.create({
                id: guildMember.id,
                ...userData,
            });
            exMember = false
        } else {
            user.set(userData);
            await user.save();
        }
        await user.setRoles(guildMember.roles.cache.keys());
        console.log(`User joined at: ${guildMember.joinedTimestamp} and watermark is ${this.highwatermark}`);
        if (this.highwatermark == 0) {
            // Skip these events if we are bootstrapping - to avoid us spamming channels with repeated user joined / welcome messages.
            return
        }
        this.events.emit('userJoined', new UserJoined(
            guildMember.id,
            (guildMember.user.globalName|| guildMember.user.username)!,
            (guildMember.nickname || guildMember.user.globalName || guildMember.user.username)!,
            exMember,
        ));
        await this.maybeSetHighestWatermark();
    }

    async guildMemberUpdate(guildMember: GuildMember, user : User | null = null) {
        user ||= await User.findByPk(guildMember.id);
        if (!user) {
            return;
        }
        let changed = false;
        const newNick = (guildMember.nickname || guildMember.user.globalName || guildMember.user.username)!;
        if (newNick != user.nickname) {
            this.events.emit('userChangedNickname', new UserChangedNickname(
                guildMember.id,
                user.nickname,
                newNick
            ));
            user.nickname = newNick;
            changed = true;
        }
        if (changed) {
            user.save();
        }
        await this.maybeSetHighestWatermark();
    }

    async guildMemberRemove(id : string, member: User | null = null) {
        if (!member) {
          member = await User.findByPk(id);
        }
        if (!member) {
            return
        }
        member.left = true;
        await member.save();
        await member.setRoles([]);
        this.events.emit('userLeft', new UserLeft(
            id,
            member.username,
            member.nickname,
        ));
        await this.maybeSetHighestWatermark();
    }

    async syncUsers(guild : Guild) {
        const members = await guild.members.fetch();
        const dbusers = await User.activeUsersMap();
        const missingMembers = [];
        for (const [id, guildMember] of members) {
            if (guildMember.user.bot) {
                continue;
            }
            const dbMember = dbusers.get(id);
            if (!dbMember) {
                missingMembers.push(id);
            } else {
                await this.guildMemberUpdate(guildMember, dbMember);
                if (JSON.stringify(Array.from(guildMember.roles.cache.keys()).sort()) 
                    != JSON.stringify((await dbMember.getRoles()).map(role => role.id).sort())
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

    async syncChannels(guild : Guild) {
        const channels = (await guild.channels.fetch()).filter(
            channel => channel?.type == ChannelType.GuildText
            || channel?.type == ChannelType.GuildCategory
            || channel?.type == ChannelType.GuildAnnouncement
            || channel?.type == ChannelType.GuildForum
        );
        const dbchannels = await Channel.channelsMap();
        const missingChannels = []
        for (const [id, _] of channels) {
            const dbChannel = dbchannels.get(id);
            if (!dbChannel) {
                missingChannels.push(id);
            }
            dbchannels.delete(id);
        }
        for (const missingId of missingChannels) {
            const guildChannel = channels.get(missingId)!;
            const data : any = {
                id: missingId,
                name: guildChannel.name,
                type: guildChannel.type.toString(),
                parentId: guildChannel.parentId,
                position: guildChannel.position,
                rawPosition: guildChannel.rawPosition,
                createdTimestamp: guildChannel.createdTimestamp,
            };
            let chan : any = null;
            if (
                guildChannel.type == ChannelType.GuildText
                || guildChannel.type == ChannelType.GuildAnnouncement
                || guildChannel.type == ChannelType.GuildForum
            ) {
                chan = guildChannel as TextChannel;
            }
            if (guildChannel.type == ChannelType.GuildCategory) {
                chan = guildChannel as CategoryChannel;
            }
            data['nsfw'] = chan.nsfw;
            data['lastMessageId'] = chan.lastMessageId;
            data['topic'] = chan.topic;
            data['rateLimitPerUser'] = chan.rateLimitPerUser;
            await Channel.create({
                ...data,
            });
        }
        for (const [_, dbChannel] of dbchannels) {
            await dbChannel.destroy();
        }
    }

    async sync(guild : Guild) {
        await this.getdb();
        await this.syncRoles(guild);
        await this.syncUsers(guild);
        await this.syncChannels(guild);
    }

    async getHighestWatermark() {
        const mark = await Watermark.findOne({order: [['time', 'DESC']]});
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
        const maxwatermark = now - 1000*5;
        const minwatermark = now - 1000*10;
        if (this.highwatermark < minwatermark) {
            return this.setHighestWatermark(maxwatermark);
        }
    }

    async setHighestWatermark(watermark: number) {
        console.log(`Set highest watermark to ${watermark}`);
        await Watermark.create({time: watermark});
        await Watermark.destroy({
            where: { time: {[Op.lt]: watermark} },
        });
        this.highwatermark = watermark;
        return Promise.resolve();
    }

    async getdiscordChannel(guild : Guild, channel_name : string) : Promise<GuildBasedChannel> {
        const channel = await Channel.findOne({ where: { name : channel_name }});
        assertIsDefined(channel);
        const discordChannel = await guild.channels.fetch(channel.id);
        assertIsDefined(discordChannel);
        return discordChannel;
    }

    async indexMessage(msg: DiscordMessage) {
        const dbMessage = await Message.findOne({where: {id: msg.id}});
        if (dbMessage) {
            if (
                (!dbMessage.editedTimestamp && msg.editedTimestamp)
                || (dbMessage.editedTimestamp && dbMessage.editedTimestamp < msg.editedTimestamp!)
                || dbMessage.hasThread != msg.hasThread
                || dbMessage.pinned != msg.pinned
            ) {
                dbMessage.content = msg.content;
                dbMessage.editedTimestamp = msg.editedTimestamp;
                dbMessage.hasThread = msg.hasThread;
                if (dbMessage.hasThread) {
                    dbMessage.threadId = msg.thread?.id || null;
                }
                dbMessage.embedCount = msg.embeds.length;
                dbMessage.pinned = msg.pinned;
                await dbMessage.save();
            }
        } else {
            await Message.create({
                id: msg.id,
                authorId: msg.author.id,
                channelId: msg.channel.id,
                applicationId: msg.applicationId || '',
                type: MessageType[msg.type],
                content: msg.content,
                createdTimestamp: msg.createdTimestamp,
                editedTimestamp: msg.editedTimestamp,
                hasThread: msg.hasThread,
                threadId: msg.thread?.id,
                embedCount: msg.embeds.length,
                pinned: msg.pinned,
            });
        }
    }

    async fetchAndStoreMessages(channel : TextBasedChannel) {
        const fetchAmount = 100;
        const options : FetchMessagesOptions = {
            limit: fetchAmount,
        };
        let msgCount = 0;
        while (true) {
            const messages = await channel.messages.fetch(options);
            await sleep(1000);

            if (messages.size > 0) {
                let earliestMessage;
                let earliestDate = Infinity;

                for (let pairs of messages) {
                    let msg = pairs[1];

                    if (msg.createdTimestamp < earliestDate) {
                        earliestDate = msg.createdTimestamp;
                        earliestMessage = msg;
                    }

                    await this.indexMessage(msg);
                }

                options.before = earliestMessage!.id
            }

            msgCount += messages.size;

            if (messages.size < fetchAmount) {
                break
            }
        }
    }

    async syncChannel(discordChannel: GuildBasedChannel) {
        if (discordChannel.type === ChannelType.GuildText) {
            await this.fetchAndStoreMessages(discordChannel);
        }
        if (discordChannel.type === ChannelType.GuildForum) {
            const activeThreads = await discordChannel.threads.fetchActive();
            const archivedThreads = await discordChannel.threads.fetchArchived({
                fetchAll: true,
                limit: 100
            });
            await sleep(1000);


            if (archivedThreads) {
                for (let pairs of archivedThreads.threads) {
                    await this.fetchAndStoreMessages(pairs[1]);
                }
            }
            if (activeThreads) {
                for (let pairs of activeThreads.threads) {
                    await this.fetchAndStoreMessages(pairs[1]);
                }
            }
        }
    }

    async syncChannelAvailableGames(guild : Guild, channel_name : string) {
        //console.log(`Sync in channel ${channel_name}`);
        const discordChannel = await this.getdiscordChannel(guild, channel_name);
        await this.syncChannel(discordChannel);
        //console.log("SYNC CHANNEL DONE");
        ///const messages = await Message.findAll({where: {channelId: discordChannel.id}});
        ///for (const msg of messages) {
            //console.log("MSG " + msg.id);
        ///}
    }

    async syncChannelOneShots(guild : Guild, channel_name : string) {
        //console.log(`Sync in channel ${channel_name}`);
        const discordChannel = await this.getdiscordChannel(guild, channel_name);
        return this.syncChannel(discordChannel);
    }

    async syncChannelNewMembers(guild : Guild, channel_name : string) {
        //console.log(`Sync in channel ${channel_name}`);
        const discordChannel = await this.getdiscordChannel(guild, channel_name);
        return this.syncChannel(discordChannel);
    }
}
