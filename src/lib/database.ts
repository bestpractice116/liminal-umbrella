
import { Sequelize, importModels } from '@sequelize/core';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { TextChannel, CategoryChannel, Guild } from 'discord.js';
import { ChannelType } from 'discord.js';
import { User, Role, Channel } from './database/model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Database {
    db: Sequelize | undefined;
    async getdb() : Promise<Sequelize> {
        this.db ||= new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false, //true,
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
        );
        const dbchannels = await Channel.channelsMap();
        const missingChannels = []
        for (const [id, _] of channels) {
            const dbChannel = dbchannels.get(id);
            if (!dbChannel) {
                missingChannels.push(id);
            }
            else {
                // FIXME - update if needed?
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
            if (guildChannel.type == ChannelType.GuildText || guildChannel.type == ChannelType.GuildAnnouncement) {
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

    async syncMessages(_ : Guild) : Promise<void> {
    }

    async sync(guild : Guild) : Promise<void> {
        await this.getdb();
        await this.db!.sync();
        await this.syncRoles(guild);
        await this.syncUsers(guild);
        await this.syncChannels(guild);
        await this.syncMessages(guild);
    }
}
