import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.renameColumn('plannedgames', 'id', 'key', { transaction });
		await qi.renameColumn('plannedgames', 'system', 'gamesystem', { transaction });
		await qi.renameColumn('plannedgames', 'datetime', 'date', { transaction });
		await qi.renameColumn('plannedgames', 'max_players', 'maxplayers', { transaction });
		await qi.addColumn(
			'plannedgames',
			'type',
			{
				type: DataTypes.STRING,
				allowNull: false
			},
			{ transaction }
		);
		await qi.addColumn(
			'plannedgames',
			'starttime',
			{
				type: DataTypes.STRING,
				allowNull: false
			},
			{ transaction }
		);
		await qi.addColumn(
			'plannedgames',
			'endtime',
			{
				type: DataTypes.STRING,
				allowNull: false
			},
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.renameColumn('plannedgames', 'key', 'id', { transaction });
		await qi.renameColumn('plannedgames', 'gamesystem', 'system', { transaction });
		await qi.renameColumn('plannedgames', 'date', 'datetime', { transaction });
		await qi.renameColumn('plannedgames', 'maxplayers', 'max_players', { transaction });
		await qi.removeColumn('plannedgames', 'type', { transaction });
		await qi.removeColumn('plannedgames', 'starttime', { transaction });
		await qi.removeColumn('plannedgames', 'endtime', { transaction });
	});
};
