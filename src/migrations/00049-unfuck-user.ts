import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    await sq.transaction(async (transaction: any) => {
      await sq.query('UPDATE messages SET id = "1293940001033424948" WHERE id = "1289929489769562112"', { raw: true, transaction });
      await sq.query('UPDATE greetingmessages SET messageId = "1293940001033424948" WHERE userId = "417047110479773707"', { raw: true, transaction });
    })
};

export const down = async (_uz: MigrationParams<any>) => {
};
