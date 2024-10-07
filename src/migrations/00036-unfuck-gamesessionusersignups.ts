import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await sq.query('ALTER TABLE gamesessionusersignups RENAME TO _gamesessionusersignups_old', { raw: true, transaction });
		await sq.query(
			'CREATE TABLE `gamesessionusersignups` (`key` INTEGER PRIMARY KEY, `userKey` TEXT NOT NULL REFERENCES `users` (`key`) ON DELETE RESTRICT ON UPDATE CASCADE, `gameSessionKey` INTEGER NOT NULL REFERENCES "gamesessions" (`key`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL)'
		);
		await sq.query('INSERT INTO gamesessionusersignups SELECT * FROM _gamesessionusersignups_old', { raw: true, transaction });
		await sq.query('DROP TABLE _gamesessionusersignups_old', { raw: true, transaction });
		await qi.addIndex(
			'gamesessionusersignups',
			{
				name: 'game_session_user_signups_user_key',
				fields: ['userKey']
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesessionusersignups',
			{
				name: 'game_session_user_signups_gamesession_key',
				fields: ['gameSessionKey']
			},
			{ transaction }
		);
	});
};

export const down = async (_uz: MigrationParams<any>) => {};
