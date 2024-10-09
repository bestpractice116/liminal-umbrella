import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await sq.query('DELETE FROM botmessages WHERE name IN ("NEW_USER_GREETING", "USER_NO_NAME_CHANGE_KICK")', { raw: true, transaction });
        await qi.bulkInsert(
            'botmessages',
            [
                {
                    name: 'NEW_USER_GREETING',
                    value: '<@${this.u.key}> Welcome to Preston RPG Community.  If you have read the rules and altered your name as asked then an Admin will be along shortly to give access to the rest of the server.',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'USER_NO_NAME_CHANGE_KICK',
                    value: "You have been removed from the Preston RPG Community Server for not following the server's real name policy.  You are welcome to rejoin; if you wish to do so please read the rules carefully and change your profile on this server. If you have any problems doing this, please post on #new_members. https://discord.gg/WDN8csyZuX",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ],
            { transaction }
        );
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
