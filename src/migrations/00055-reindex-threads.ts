import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await sq.query('DELETE FROM threads', { raw: true, transaction });
    });
    await sq.query('VACUUM');
};

export const down = async (_uz: MigrationParams<any>) => {};
