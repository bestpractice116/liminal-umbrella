import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.changeColumn(
			'messages',
			'pinned',
			{
				type: DataTypes.INTEGER,
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
		await qi.changeColumn(
			'messages',
			'pinned',
			{
				type: DataTypes.INTEGER,
				allowNull: true
			},
			{ transaction }
		);
	});
};
