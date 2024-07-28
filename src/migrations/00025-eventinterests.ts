/* 2024-07-27 03:35:54 - DEBUG - Executing (default): CREATE TABLE IF NOT EXISTS 
    `EventInterests` (
        `key` TEXT NOT NULL PRIMARY KEY, 
        `guildScheduledEventId` TEXT REFERENCES `GameSessions` (`key`) ON DELETE SET NULL ON UPDATE CASCADE, 
        `userId` TEXT REFERENCES `Users` (`key`) ON DELETE SET NULL ON UPDATE CASCADE, 
        `createdAt` TEXT NOT NULL, `updatedAt` TEXT NOT NULL);
2024-07-27 03:35:54 - DEBUG - Executing (default): PRAGMA INDEX_LIST(`EventInterests`)
2024-07-27 03:35:54 - DEBUG - Executing (default): PRAGMA INDEX_INFO(`sqlite_autoindex_EventInterests_1`)
2024-07-27 03:35:54 - DEBUG - Executing (default): CREATE INDEX `event_interests_guild_scheduled_event_id`
     ON `EventInterests` (`guildScheduledEventId`)
2024-07-27 03:35:54 - DEBUG - Executing (default): CREATE INDEX `event_interests_user_id`
    ON `EventInterests` (`userId`)
*/

import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.createTable(
			'eventinterests',
			{
				key: {
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
				},
				guildScheduledEventId: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				userId: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				createdAt: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				updatedAt: {
					type: DataTypes.TEXT,
					allowNull: false
				}
			},
			{ transaction }
		);
		await qi.addIndex(
			'eventinterests',
			{
				name: 'event_interests_guild_scheduled_event_id',
				fields: ['guildScheduledEventId']
			},
			{ transaction }
		);
		await qi.addIndex(
			'eventinterests',
			{
				name: 'event_interests_user_id',
				fields: ['userId']
			},
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropTable('eventinterests', { transaction });
	});
};
