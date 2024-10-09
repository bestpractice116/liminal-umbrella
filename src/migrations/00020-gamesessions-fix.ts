import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.changeColumn(
            'gamesessions',
            'key',
            {
                autoIncrement: false
            },
            { transaction }
        );
        await qi.changeColumn(
            'gamesessions',
            'gamesystem',
            {
                references: {
                    table: 'gamesystems',
                    key: 'key'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            { transaction }
        );
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
