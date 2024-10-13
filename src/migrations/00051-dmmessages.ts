import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.bulkInsert(
            'botmessages',
            [
                {
                    name: 'DM_REPLY_NEVER_MEMBER',
                    value: "Sorry, I can't help you. I'm the RPGBot and I automate some of the admin work on the Preston RPG community. Please join the community and post if you need help",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'DM_REPLY_EX_MEMBER',
                    value: "Sorry, I can't help you. I'm the RPGBot and I automate some of the admin work on the Preston RPG community. If you have any questions or queries, please rejoin the community and speak to one of the admin team.",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
		{
                    name: 'DM_REPLY_MEMBER',
                    value: "Sorry, I don't know what to do with DMs at the moment, so I can't help you. I'm the RPGBot and I automate some of the admin work on the Preston RPG community. If you have any questions or queries, please post in <#1085979361066373240>.",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ],
            { transaction }
        );
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
