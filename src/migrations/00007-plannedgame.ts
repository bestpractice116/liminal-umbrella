import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.addColumn('plannedgames', 'signed_up_players', {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	});
	await qi.addColumn('plannedgames', 'location', {
		type: DataTypes.TEXT,
		allowNull: true,
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface()
	await qi.dropColumn('plannedgames', 'signed_up_players');
	await qi.dropColumn('plannedgames', 'location');
};
