import type { MigrationParams } from 'umzug';

const data = [
    ['LABEL_POST_GAME_NAME', 'Name'],
    ['TOOLTIP_POST_GAME_NAME', ''],
    ['LABEL_POST_GAME_DATE', 'Date'],
    ['TOOLTIP_POST_GAME_DATE', ''],
    ['LABEL_POST_GAME_START_TIME', 'Start Time'],
    ['TOOLTIP_POST_GAME_START_TIME', ''],
    ['LABEL_POST_GAME_END_TIME', 'End Time'],
    ['TOOLTIP_POST_GAME_END_TIME', ''],
    ['LABEL_POST_GAME_LOCATION', 'Location'],
    ['TOOLTIP_POST_GAME_LOCATION', ''],
    ['LABEL_POST_GAME_DESCRIPTION', 'Description'],
    ['TOOLTIP_POST_GAME_DESCRIPTION', ''],
    ['LABEL_POST_GAME_MAX_PLAYERS', 'Max Players'],
    ['TOOLTIP_POST_GAME_MAX_PLAYERS', ''],
    ['BUTTON_NEW_GAME_POST_GAME', 'Post Game']
];

const clean = (uz: MigrationParams<any>, transaction: any) => {
    const qi = uz.context.sequelize.getQueryInterface();
    return qi.bulkDelete('botmessages', { name: data.map(([name, _value]) => name) }, { transaction });
};

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await clean(uz, transaction);
        await qi.bulkInsert(
            'botmessages',
            data.map(([name, value]) => {
                return {
                    name,
                    value,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }),
            { transaction }
        );
    });
};

export const down = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    await sq.transaction(async (transaction: any) => {
        await clean(uz, transaction);
    });
};
