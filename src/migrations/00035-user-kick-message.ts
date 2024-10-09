import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.bulkInsert(
            'botmessages',
            [
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
