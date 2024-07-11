import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.addColumn(
			'plannedgames',
			'signed_up_players',
			{
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			{ transaction }
		);
		await qi.addColumn(
			'plannedgames',
			'location',
			{
				type: DataTypes.TEXT,
				allowNull: true
			},
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropColumn('plannedgames', 'signed_up_players', { transaction });
		await qi.dropColumn('plannedgames', 'location', { transaction });
	});
};
