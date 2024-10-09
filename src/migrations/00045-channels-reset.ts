import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    await sq.transaction(async (transaction: any) => {
        await sq.query('UPDATE channels SET lastSeenIndexedToDate = date("1970-01-01 12:00:00")', { raw: true, transaction });
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
