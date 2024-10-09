import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    await sq.transaction(async (transaction: any) => {
        await sq.query('DELETE FROM plannedgames', { raw: true, transaction });
        await sq.query('DELETE FROM gamesessionusersignups', { raw: true, transaction });
        await sq.query('DELETE FROM gamesessions', { raw: true, transaction });
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
