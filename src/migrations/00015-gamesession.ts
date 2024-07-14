import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropTable('gamesessions', { transaction });
		await qi.createTable(
			'gamesessions',
			{
				key: {
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
					autoIncrement: true
				},
				owner: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				gameListingsMessageId: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				eventId: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				channelId: {
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
			'gamesessions',
			{
				name: 'game_sessions_owner',
				fields: ['owner']
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesessions',
			{
				name: 'game_sessions_gane_listings_message_id_unique',
				fields: ['gameListingsMessageId'],
				unique: true
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesessions',
			{
				name: 'game_sessions_event_id_unique',
				fields: ['eventId'],
				unique: true
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesessions',
			{
				name: 'game_sessions_channel_id_unique',
				fields: ['channelId'],
				unique: true
			},
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropTable('gamesessions', { transaction });
		await qi.createTable(
			'gamesessions',
			{
				id: {
					type: DataTypes.TEXT,
					allowNull: false,
					primaryKey: true
				},
				availableGamesMessageId: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'messages',
						key: 'id'
					},
					onDelete: 'RESTRICT',
					onUpdate: 'RESTRICT'
				},
				eventId: {
					type: DataTypes.TEXT,
					allowNull: true
				},
				channelId: {
					type: DataTypes.TEXT,
					allowNull: true,
					references: {
						table: 'channels',
						key: 'id'
					},
					onDelete: 'RESTRICT',
					onUpdate: 'RESTRICT'
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
		/*
		CREATE UNIQUE INDEX `game_sessions_available_games_message_id_unique` ON `GameSessions` (`availableGamesMessageId`);
		CREATE UNIQUE INDEX `game_sessions_event_id_unique` ON `GameSessions` (`eventId`);
		CREATE UNIQUE INDEX `game_sessions_channel_id_unique` ON `GameSessions` (`channelId`);
		*/
		await qi.addIndex(
			'gamesessions',
			{
				name: 'game_sessions_available_games_message_id_unique',
				fields: ['availableGamesMessageId'],
				unique: true
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesessions',
			{
				name: 'game_sessions_event_id_unique',
				fields: ['eventId'],
				unique: true
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesessions',
			{
				name: 'game_sessions_channel_id_unique',
				fields: ['channelId'],
				unique: true
			},
			{ transaction }
		);
	});
};
