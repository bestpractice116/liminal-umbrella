import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    await sq.transaction(async (transaction: any) => {
      await sq.query('DELETE FROM botmessages WHERE name IN ("DM_REPLY_NEVER_MEMBER", "DM_REPLY_EX_MEMBER")', { transaction });
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
