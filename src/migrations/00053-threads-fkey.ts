import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    await sq.transaction(async (transaction: any) => {
      await sq.query('ALTER TABLE threads RENAME TO _threads_old', { raw: true, transaction });
      await sq.query(
	  'CREATE TABLE "threads" (`key` TEXT NOT NULL UNIQUE PRIMARY KEY, `name` TEXT NOT NULL, `parentId` TEXT NOT NULL REFERENCES `channels` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT, `archived` INTEGER NOT NULL, `archiveTimestamp` INTEGER NOT NULL, `locked` INTEGER NOT NULL, `createdTimestamp` INTEGER NOT NULL, `lastMessageId` TEXT, `lastSeenIndexedToDate` TEXT, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)',
          { raw: true, transaction }
      );
      await sq.query('INSERT INTO threads SELECT * FROM _threads_old', { raw: true, transaction });
      await sq.query('DROP TABLE  _threads_old', { raw: true, transaction });
    });
    await sq.query('VACUUM');
};

export const down = async (_uz: MigrationParams<any>) => {};
