
import { Sequelize, importModels } from '@sequelize/core';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { TextChannel, TextBasedChannel, CategoryChannel, Guild, FetchMessagesOptions, Message as DiscordMessage } from 'discord.js';
import { ChannelType, GuildBasedChannel, MessageType } from 'discord.js';
import { User, Role, Channel, Message } from './database/model.js';

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
    async getdb() : Promise<Sequelize> {
        this.db ||= new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: true,
            storage: path.join(__dirname, '..', '..', 'database.sqlite'),
            models: await importModels(__dirname + '/database/model/*.js'),
        });
        return this.db
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

    async syncUsers(guild : Guild) : Promise<void> {
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
                // FIXME - update user stuff if needed?
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
            const user = await User.create({
                id: missingId,
                username: (guildMember.nickname || guildMember.user.globalName)!,
                rulesaccepted: false, // FIXME
                left: false,
            });
            await user.setRoles(guildMember.roles.cache.keys());
        }
        for (const [id, dbMember] of dbusers) {
            console.log("database has user who has left " + id);
            dbMember.left = true;
            await dbMember.save();
            await dbMember.setRoles([]);
        }
    }

    async syncChannels(guild : Guild) : Promise<void> {
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
        for (const [id, dbChannel] of dbchannels) {
            console.log("database has channel which was deleted " + id);
            await dbChannel.destroy();
        }
    }

    async sync(guild : Guild) : Promise<void> {
        await this.getdb();
        await this.db!.sync();
        await this.syncRoles(guild);
        await this.syncUsers(guild);
        console.log("sync channels");
        await this.syncChannels(guild);
        console.log("done sync channels");
    }

    async getdiscordChannel(guild : Guild, channel_name : string) : Promise<GuildBasedChannel> {
        const channel = await Channel.findOne({ where: { name : channel_name }});
        console.log(`FIND ${channel_name} found ${channel}`);
        assertIsDefined(channel);
        const discordChannel = await guild.channels.fetch(channel.id);
        assertIsDefined(discordChannel);
        return discordChannel;
    }

    async indexMessage(msg: DiscordMessage) : Promise<void> {
        const dbMessage = await Message.findOne({where: {id: msg.id}});
        if (dbMessage) {
            console.log(`Already have message ${dbMessage.id}`);
            if (
                (!dbMessage.editedTimestamp && msg.editedTimestamp)
                || (dbMessage.editedTimestamp && dbMessage.editedTimestamp < msg.editedTimestamp!)
                || dbMessage.hasThread != msg.hasThread
                || dbMessage.pinned != msg.pinned
            ) {
                console.log(`Updating message ${dbMessage.id}`);
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
            console.log(`Updating message ${msg.id}`);
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

    async fetchAndStoreMessages(channel : TextBasedChannel) : Promise<void> {
        const fetchAmount = 100;
        const options : FetchMessagesOptions = {
            limit: fetchAmount,
        };
        let msgCount = 0;
        while (true) {
            const messages = await channel.messages.fetch(options);
            await sleep(1000);

            if (messages.size > 0) {
                console.log(`Has messages: ${messages.size}`);
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
                console.log("break");
                break
            }
        }
    }

    async syncChannel(guild : Guild, channel_name : string) : Promise<void> {
        console.log(`Sync in channel ${channel_name}`);
        const discordChannel = await this.getdiscordChannel(guild, channel_name);

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

    async syncChannelAvailableGames(guild : Guild, channel_name : string) : Promise<void> {
        return this.syncChannel(guild, channel_name)
    }

    async syncChannelOneShots(guild : Guild, channel_name : string) : Promise<void> {
        return this.syncChannel(guild, channel_name)
    }
}
