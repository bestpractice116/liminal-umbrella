import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.createTable(
			'campaigns',
			{
				key: {
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false
				},
				dmUser: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'users',
						key: 'key'
					},
					onDelete: 'RESTRICT',
					onUpdate: 'RESTRICT'
				},
				role: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'roles',
						key: 'key'
					},
					onDelete: 'RESTRICT',
					onUpdate: 'RESTRICT'
				},
				gamesystem: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'gamesystems',
						key: 'key'
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
		await qi.addIndex(
			'campaigns',
			{
				name: 'campaigns_dmuser',
				fields: ['dmUser']
			},
			{ transaction }
		);
		await qi.addIndex(
			'campaigns',
			{
				name: 'campaigns_role',
				fields: ['role'],
				unique: true
			},
			{ transaction }
		);
		await qi.createTable(
			'campaignplayers',
			{
				userKey: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'users',
						key: 'key'
					},
					onDelete: 'RESTRICT',
					onUpdate: 'RESTRICT'
				},
				campaignKey: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'campaigns',
						key: 'key'
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
		await qi.addIndex(
			'campaignplayers',
			{
				name: 'campaignplayers_user_key',
				fields: ['userKey']
			},
			{ transaction }
		);
		await qi.addIndex(
			'campaignplayers',
			{
				name: 'campaignplayers_campaign_key',
				fields: ['campaignKey']
			},
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropTable('campaigns', { transaction });
		await qi.dropTable('campaignplayers', { transaction });
	});
};
