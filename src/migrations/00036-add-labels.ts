import type { MigrationParams } from 'umzug';

const data = [
    ['LABEL_POST_GAME_NAME', 'Name'],
    ['TOOLTIP_POST_GAME_NAME', ''],
    ['LABEL_POST_GAME_DATE', 'Date'],
    ['TOOLTIP_POST_GAME_DATE', ''],
    ['LABEL_POST_GAME_GAMESYSTEM', 'Game System'],
    ['TOOLTIP_POST_GAME_GAMESYSTEM', ''],
    ['LABEL_POST_GAME_TYPE', 'Type of Adventure'],
    ['TOOLTIP_POST_GAME_TYPE', ''],
    ['LABEL_POST_GAME_STARTTIME', 'Start Time'],
    ['TOOLTIP_POST_GAME_STARTTIME', ''],
    ['LABEL_POST_GAME_ENDTIME', 'End Time'],
    ['TOOLTIP_POST_GAME_ENDTIME', ''],
    ['LABEL_POST_GAME_LOCATION', 'Location'],
    ['TOOLTIP_POST_GAME_LOCATION', ''],
    ['LABEL_POST_GAME_DESCRIPTION', 'Description'],
    ['TOOLTIP_POST_GAME_DESCRIPTION', ''],
    ['LABEL_POST_GAME_MAXPLAYERS', 'Max Players'],
    ['TOOLTIP_POST_GAME_MAXPLAYERS', ''],
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
        await qi.bulkDelete(
            'botmessages',
            {
                name: [
                    'LABEL_POST_GAME_MAX_PLAYERS',
                    'TOOLTIP_POST_GAME_MAX_PLAYERS',
                    'LABEL_POST_GAME_START_TIME',
                    'TOOLTIP_POST_GAME_START_TIME',
                    'LABEL_POST_GAME_END_TIME',
                    'TOOLTIP_POST_GAME_END_TIME'
                ]
            },
            { transaction }
        );
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
