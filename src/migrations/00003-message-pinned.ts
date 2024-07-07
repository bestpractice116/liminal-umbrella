import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.changeColumn('messages', 'pinned', {
		type: DataTypes.INTEGER,
		allowNull: false
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.changeColumn('messages', 'pinned', {
		type: DataTypes.INTEGER,
		allowNull: true
	});
};
