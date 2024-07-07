import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';
//import { Message } from '../lib/database/model.js';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	try {
		await qi.removeColumn('users', 'name');
	} catch (Exception) {}
	try {
		await qi.removeColumn('users', 'avatarURL');
	} catch (Exception) {}
	try {
		await qi.removeColumn('users', 'joinedDiscordAt');
	} catch (Exception) {}
	await qi.addColumn('users', 'name', {
		type: DataTypes.STRING,
		allowNull: true
	});
	await qi.addColumn('users', 'avatarURL', {
		type: DataTypes.STRING,
		allowNull: true
	});
	await qi.addColumn('users', 'joinedDiscordAt', {
		type: DataTypes.INTEGER,
		allowNull: true
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.removeColumn('users', 'name');
	await qi.removeColumn('users', 'avatarURL');
	await qi.removeColumn('users', 'joinedDiscordAt');
};
