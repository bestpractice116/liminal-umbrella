import type { MigrationParams } from 'umzug';
import { DataTypes } from '@sequelize/core';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropTable('rolemembers', { transaction });
		await qi.renameColumn('users', 'id', 'key', { transaction });
		await qi.renameColumn('roles', 'id', 'key', { transaction });
		await qi.createTable(
			'rolemembers',
			{
				userkey: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'users',
						key: 'key'
					},
					onDelete: 'CASCADE',
					onUpdate: 'CASCADE'
				},
				roleKey: {
					type: DataTypes.TEXT,
					allowNull: false,
					references: {
						table: 'roles',
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
	});
};

export const down = async (_uz: MigrationParams<any>) => {};
