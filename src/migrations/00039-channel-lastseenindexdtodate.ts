import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		// Add the column to the users table
		await qi.addColumn(
			'channels',
			'lastSeenIndexedToDate',
			{
				type: DataTypes.DATE,
				allowNull: true
			},
			{ transaction }
		);
		await qi.addColumn(
			'channels',
			'lastSeenIndexedFromDate',
			{
				type: DataTypes.DATE,
				allowNull: true
			},
			{ transaction }
		);
		await sq.query('UPDATE channels SET lastSeenIndexedToDate = date("1970-01-01 12:00:00")', { raw: true, transaction });
		await sq.query('UPDATE channels SET lastSeenIndexedFromDate = date("now")', { raw: true, transaction });
		await qi.addColumn(
			'channels',
			'lastSeenIndexedToDate',
			{
				type: DataTypes.DATE,
				allowNull: false
			},
			{ transaction }
		);
		await qi.addColumn(
			'channels',
			'lastSeenIndexedFromDate',
			{
				type: DataTypes.DATE,
				allowNull: false
			},
			{ transaction }
		);
	});
};

export const down = async (_uz: MigrationParams<any>) => {};
