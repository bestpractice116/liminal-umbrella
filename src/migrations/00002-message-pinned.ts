import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';
//import { Message } from '../lib/database/model.js';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	try {
		await qi.removeColumn('messages', 'pinned');
	} catch (Exception) {
	}
	await qi.addColumn('messages', 'pinned', {
	    type: DataTypes.INTEGER,
	    allowNull: true,
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface()
	await qi.removeColumn('messages', 'pinned')
};
