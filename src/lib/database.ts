
import { Sequelize, importModels } from '@sequelize/core';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { Guild } from 'discord.js';
import { User, Role } from './database/model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const db = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false, //true,
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
    models: await importModels(__dirname + '/database/model/*.js'),
});

async function syncRoles(guild : Guild) : Promise<void> {
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

async function syncUsers(guild : Guild) : Promise<void> {
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

export async function sync(guild : Guild) : Promise<void> {
    await syncRoles(guild);
    await syncUsers(guild);
}

