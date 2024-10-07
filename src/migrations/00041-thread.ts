import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.createTable(
			'threads',
			{
				key: {
					type: DataTypes.STRING,
					allowNull: false,
					primaryKey: true
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false
				},
				parentId: {
					type: DataTypes.STRING,
					allowNull: false,
					references: {
						table: 'channels',
						key: 'id'
					},
					onDelete: 'RESTRICT',
					onUpdate: 'RESTRICT'
				},
				archived: {
					type: DataTypes.BOOLEAN,
					allowNull: false
				},
				archiveTimestamp: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				locked: {
					type: DataTypes.BOOLEAN,
					allowNull: false
				},
				createdTimestamp: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				lastMessageId: {
					type: DataTypes.STRING,
					allowNull: true
				},
				lastSeenIndexedToDate: {
					type: DataTypes.DATE,
					allowNull: true
				},
				lastSeenIndexedFromDate: {
					type: DataTypes.DATE,
					allowNull: true
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
				fields: ['roleKey'],
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
		await qi.dropTable('threads', { transaction });
	});
};
