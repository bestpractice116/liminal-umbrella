import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.createTable(
			'botmessages',
			{
				key: {
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
					autoIncrement: true
				},
				name: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				value: {
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
			'botmessages',
			{
				name: 'botmessages_name_unique',
				fields: ['name'],
				unique: true
			},
			{ transaction }
		);
		await qi.bulkInsert(
			'botmessages',
			[
				{
					name: 'NEW_USER_GREETING',
					value: '<@${e.id}> Welcome to Preston RPG Community.  If you have read the rules and altered your name as asked then an Admin will be along shortly to give access to the rest of the server.',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			],
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropTable('botmessages', { transaction });
	});
};
