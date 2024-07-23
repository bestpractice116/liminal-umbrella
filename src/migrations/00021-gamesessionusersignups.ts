import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.createTable(
			'gamesessionusersignups',
			{
				key: {
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true
				},
				userKey: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'users',
						key: 'key'
					},
					onDelete: 'RESTRICT',
					onUpdate: 'CASCADE'
				},
				gameSessionKey: {
					type: DataTypes.INTEGER,
					allowNull: false,
					references: {
						table: 'gamesessions',
						key: 'key'
					},
					onDelete: 'CASCADE',
					onUpdate: 'CASCADE'
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
			'gamesessionusersignups',
			{
				name: 'game_session_user_signups_game_session_key',
				fields: ['gameSessionKey']
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesessionusersignups',
			{
				name: 'game_session_user_signups_user_key',
				fields: ['userKey'],
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
		await qi.dropTable('gamesessionusersignups', { transaction });
	});
};
