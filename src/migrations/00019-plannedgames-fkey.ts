import type { MigrationParams } from 'umzug';
import { DataTypes } from '@sequelize/core';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.changeColumn(
			'plannedgames',
			'owner',
			{
				references: {
					table: 'users',
					key: 'key'
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE'
			},
			{ transaction }
		);
		await qi.changeColumn(
			'plannedgames',
			'gamesystem',
			{
				references: {
					table: 'gamesystems',
					key: 'key'
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE'
			},
			{ transaction }
		);
		await qi.changeColumn(
			'plannedgames',
			'type',
			{
				type: DataTypes.STRING,
				allowNull: true
			},
			{ transaction }
		);
	});
};

export const down = async (_uz: MigrationParams<any>) => {};
