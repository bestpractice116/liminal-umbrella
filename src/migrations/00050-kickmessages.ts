import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.bulkInsert(
            'botmessages',
            [
                {
                    name: 'MEMBER_WINNOW_KICK',
                    value: "Hi, I'm the RPGBot and I automate some of the admin work on the Preston RPG community.  You haven't played 3 games and got `Known Member` within 6 months of joining, therefore I have removed you from the server.\n\nThat’s because the Discord server is for members to organise games; actively participating is one of the rules you agreed to when joining.  You are very welcome to join [our Facebook group](https://www.facebook.com/groups/prestonrpgcommunity) which has no participation requirements.  If you have time and desire to join in games in the future, [we'd love to have you back](https://discord.gg/WDN8csyZuX).\n\nThanks for your understanding.",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'KNOWN_MEMBER_WINNOW_KICK',
                    value: "Hi, I'm the RPGBot and I automate some of the admin work on the Preston RPG community.  You haven't played games for 9 months, therefore I have removed you from the server.\n\nThat’s because the Discord server is for members to organise games; actively participating is one of the rules you agreed to when joining.  You are very welcome to join [our Facebook group](https://www.facebook.com/groups/prestonrpgcommunity) which has no participation requirements.  If you have time and desire to join in games in the future, [we'd love to have you back](https://discord.gg/WDN8csyZuX).\n\nThanks for your understanding.",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ],
            { transaction }
        );
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
